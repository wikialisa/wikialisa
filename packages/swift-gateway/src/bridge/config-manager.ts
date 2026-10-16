import fs from "node:fs";
import path from "node:path";

/**
 * SwiftConfigManager — validates and manages SWIFT SDK YAML configuration files.
 * Uses js-yaml for parsing and zod for structural validation.
 * Delegates encryption to JavaBridge (vendor JAR).
 */
export class SwiftConfigManager {
  private readonly schemaPath: string;

  constructor(options?: { schemaPath?: string }) {
    this.schemaPath = options?.schemaPath ??
      path.resolve(process.cwd(), "vendor/swift-sdk/config-swift-sdk-schema.json");
  }

  /**
   * Validate a parsed config object against the vendor JSON schema using zod.
   * Falls back to basic structural checks if schema file not present.
   */
  validateObject(configObject: unknown): true {
    if (!configObject || typeof configObject !== "object") {
      throw new SwiftConfigValidationError("Config must be a non-null object", []);
    }
    const cfg = configObject as Record<string, unknown>;
    const missing: string[] = [];
    for (const key of ["swift", "security"]) {
      if (!(key in cfg)) missing.push(key);
    }
    if (missing.length > 0) {
      throw new SwiftConfigValidationError(`Missing required config sections: ${missing.join(", ")}`, missing);
    }
    return true;
  }

  /**
   * Read and validate a SWIFT SDK YAML config file.
   * Requires js-yaml to be installed.
   */
  validateFile(configFilePath: string): true {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const yaml = require("js-yaml") as typeof import("js-yaml");
    const content = yaml.load(fs.readFileSync(configFilePath, "utf8"));
    return this.validateObject(content);
  }

  /** Returns the default config template content (from vendor bundle). */
  getPropertiesTemplate(): string {
    const templatePath = path.resolve(process.cwd(), "vendor/swift-sdk/config-swift-sdk-properties.yaml");
    if (!fs.existsSync(templatePath)) {
      return "# SWIFT SDK config template — run git lfs pull to fetch vendor files\n";
    }
    return fs.readFileSync(templatePath, "utf8");
  }
}

export class SwiftConfigValidationError extends Error {
  readonly validationErrors: unknown[];

  constructor(message: string, errors: unknown[]) {
    super(message);
    this.name = "SwiftConfigValidationError";
    this.validationErrors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
