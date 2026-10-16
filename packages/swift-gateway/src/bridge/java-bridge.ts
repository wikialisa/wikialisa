import { exec, execSync } from "node:child_process";
import { spawn } from "node:child_process";
import path from "node:path";
import util from "node:util";

const execPromise = util.promisify(exec);

/**
 * JavaBridge — async Node.js ↔ Java interop for SWIFT vendor JARs.
 * Wraps child-process invocation so TypeScript services never shell out directly.
 * Requires JRE/JDK ≥ 17 on PATH.
 *
 * Vendor references:
 *   vendor/swift-sdk/file-encryptor-decryptor-2.17.1-3.jar
 *   vendor/swift-security-sdk/OAuthSession
 */
export class JavaBridge {
  private readonly encryptorJar: string;

  constructor(options?: { encryptorJarPath?: string; vendorSdkPath?: string }) {
    const base = options?.vendorSdkPath ?? path.resolve(process.cwd(), "vendor/swift-sdk");
    this.encryptorJar = options?.encryptorJarPath ?? path.join(base, "file-encryptor-decryptor-2.17.1-3.jar");
  }

  /** Encrypt a SWIFT config YAML file via the vendor encryptor JAR. */
  async encryptConfigFile(inputYaml: string, outputEncrypted: string, secretKey: string): Promise<string> {
    const { stdout } = await execPromise(
      `java -jar "${this.encryptorJar}" encrypt -i "${inputYaml}" -o "${outputEncrypted}" -k "${secretKey}"`
    ).catch((err: Error) => { throw new Error(`[JavaBridge] encryptConfigFile: ${err.message}`); });
    return stdout.trim();
  }

  /** Decrypt a previously encrypted SWIFT config file. */
  async decryptConfigFile(inputEncrypted: string, outputYaml: string, secretKey: string): Promise<string> {
    const { stdout } = await execPromise(
      `java -jar "${this.encryptorJar}" decrypt -i "${inputEncrypted}" -o "${outputYaml}" -k "${secretKey}"`
    ).catch((err: Error) => { throw new Error(`[JavaBridge] decryptConfigFile: ${err.message}`); });
    return stdout.trim();
  }

  /** Run any JAR with arbitrary arguments. */
  async runJar(jarPath: string, args: string[]): Promise<string> {
    const cmd = [`java -jar "${jarPath}"`, ...args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(" ")].join(" ");
    const { stdout } = await execPromise(cmd).catch((err: Error) => { throw new Error(`[JavaBridge] runJar: ${err.message}`); });
    return stdout.trim();
  }
}

/**
 * JavaBridgeAdapter — spawns a Java class inside a JAR via child_process.spawn.
 * Use for long-running or streaming Java processes.
 */
export class JavaBridgeAdapter {
  private readonly jarPath: string;

  constructor(jarPath: string) {
    this.jarPath = jarPath;
  }

  async execute(className: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn("java", ["-cp", this.jarPath, className, ...args]);
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (c: Buffer) => { stdout += c.toString("utf8"); });
      child.stderr.on("data", (c: Buffer) => { stderr += c.toString("utf8"); });
      child.on("close", (code) => {
        code === 0
          ? resolve(stdout.trimEnd())
          : reject(new Error(`JavaBridgeAdapter: exit ${code}\nstderr: ${stderr.trimEnd()}`));
      });
      child.on("error", (err) => reject(new Error(`JavaBridgeAdapter: spawn failed — ${err.message}`)));
    });
  }
}

/**
 * FileEncryptorAdapter — AES-256-CBC file encryption using Node.js crypto.
 * Fallback when the vendor JAR is not available (e.g. CI without JVM).
 */
export class FileEncryptorAdapter {
  private readonly salt = Buffer.from("vnkrvietnam-swift-sdk-salt-2024!");

  private deriveKey(password: string): Buffer {
    const { scryptSync } = require("node:crypto") as typeof import("node:crypto");
    return scryptSync(password, this.salt, 32) as Buffer;
  }

  async encrypt(inputPath: string, outputPath: string, key: string): Promise<void> {
    const { createCipheriv, randomBytes } = require("node:crypto") as typeof import("node:crypto");
    const { readFile, writeFile } = require("node:fs/promises") as typeof import("node:fs/promises");
    const plaintext = await readFile(inputPath);
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", this.deriveKey(key), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    await writeFile(outputPath, Buffer.concat([iv, encrypted]));
  }

  async decrypt(inputPath: string, outputPath: string, key: string): Promise<void> {
    const { createDecipheriv } = require("node:crypto") as typeof import("node:crypto");
    const { readFile, writeFile } = require("node:fs/promises") as typeof import("node:fs/promises");
    const data = await readFile(inputPath);
    const iv = data.subarray(0, 16);
    const encrypted = data.subarray(16);
    const decipher = createDecipheriv("aes-256-cbc", this.deriveKey(key), iv);
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    await writeFile(outputPath, plaintext);
  }
}
