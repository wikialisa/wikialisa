#!/usr/bin/env node
/**
 * detect-changed.mjs
 *
 * Phát hiện packages @wikialisa/* nào đã thay đổi so với tag git trước nhất,
 * rồi xuất ra GitHub Actions output để dùng làm matrix.
 *
 * Output (GitHub Actions):
 *   matrix       = JSON array of { name, dir, version }
 *   has_packages = "true" | "false"
 *
 * Env vars:
 *   PACKAGE_FILTER — nếu set, chỉ include package có name khớp
 *   GITHUB_OUTPUT  — path do GitHub Actions cung cấp tự động
 */

import { execSync } from "node:child_process";
import { readFileSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../..");

// ─── Danh sách tất cả packages publishable ────────────────────────────────
// Thêm package mới: chỉ cần thêm 1 dòng vào đây
const ALL_PACKAGES = [
  { dir: "packages/config",        name: "@wikialisa/config"        },
  { dir: "packages/types",         name: "@wikialisa/types"          },
  { dir: "packages/contracts",     name: "@wikialisa/contracts"      },
  { dir: "packages/core-sdk",      name: "@wikialisa/core-sdk"       },
  { dir: "packages/merchant-sdk",  name: "@wikialisa/merchant-sdk"   },
  { dir: "packages/web3-config",   name: "@wikialisa/web3-config"    },
  { dir: "packages/ui-kit",        name: "@wikialisa/ui-kit"         },
  { dir: "packages/db",            name: "@wikialisa/db"             },
  { dir: "packages/sdk-swift",     name: "@wikialisa/sdk-swift"      },
  { dir: "packages/swift-core",    name: "@wikialisa/swift-core"     },
  { dir: "packages/swift-gateway", name: "@wikialisa/swift-gateway"  },
  // ↓ Thêm package mới tại đây ↓
  // { dir: "packages/swift-adapter", name: "@wikialisa/swift-adapter" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function getPkgVersion(dir) {
  try {
    const meta = JSON.parse(readFileSync(resolve(ROOT, dir, "package.json"), "utf8"));
    return meta.version ?? "0.0.0";
  } catch {
    return null;
  }
}

function isPrivate(dir) {
  try {
    const meta = JSON.parse(readFileSync(resolve(ROOT, dir, "package.json"), "utf8"));
    return meta.private === true;
  } catch {
    return true;
  }
}

function setOutput(key, value) {
  const ghOutput = process.env.GITHUB_OUTPUT;
  if (ghOutput) {
    // Multi-line safe encoding
    appendFileSync(ghOutput, `${key}<<EOF\n${value}\nEOF\n`);
  } else {
    // Local dev: print to stdout
    console.log(`::set-output name=${key}::${value}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────
const PACKAGE_FILTER = process.env.PACKAGE_FILTER?.trim() ?? "";

// Lấy tag gần nhất TRƯỚC tag hiện tại (hoặc trước HEAD)
// git describe --tags --abbrev=0 HEAD~1 → tag ngay trước commit hiện tại
const currentTag = run("git tag --points-at HEAD");
const prevTag    = currentTag
  ? run(`git describe --tags --abbrev=0 ${currentTag}^ 2>/dev/null`)
  : run("git describe --tags --abbrev=0 HEAD^ 2>/dev/null");

console.log(`\n🏷️  Current tag : ${currentTag || "(none)"}`);
console.log(`🔍 Previous tag : ${prevTag  || "(none — will publish ALL)"}`);

// Lấy danh sách file thay đổi từ prevTag đến HEAD
const changedFiles = prevTag
  ? run(`git diff --name-only ${prevTag} HEAD`).split("\n").filter(Boolean)
  : [];

// Không có prevTag → đây là lần release đầu tiên → publish tất cả
const forceAll = !prevTag || changedFiles.length === 0;
if (forceAll) console.log("⚠  No previous tag — publishing ALL packages\n");

const matrix = [];

for (const pkg of ALL_PACKAGES) {
  // Bỏ qua private packages
  if (isPrivate(pkg.dir)) {
    console.log(`  ⊘  ${pkg.name} — private, skipped`);
    continue;
  }

  // Áp dụng filter thủ công (workflow_dispatch)
  if (PACKAGE_FILTER && !pkg.name.includes(PACKAGE_FILTER)) {
    console.log(`  ─  ${pkg.name} — filtered out`);
    continue;
  }

  // Kiểm tra có thay đổi trong thư mục package không
  const hasChange = forceAll || changedFiles.some((f) => f.startsWith(pkg.dir + "/"));

  const version = getPkgVersion(pkg.dir);
  if (version === null) {
    console.log(`  ✗  ${pkg.name} — no package.json, skipped`);
    continue;
  }

  if (hasChange) {
    matrix.push({ ...pkg, version });
    console.log(`  ✅ ${pkg.name}@${version} — CHANGED, will publish`);
  } else {
    console.log(`  ─  ${pkg.name}@${version} — no changes, skipped`);
  }
}

console.log(`\n📦 Packages to publish: ${matrix.length}`);

setOutput("matrix", JSON.stringify(matrix));
setOutput("has_packages", matrix.length > 0 ? "true" : "false");
