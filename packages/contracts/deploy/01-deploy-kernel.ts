import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// ─── 01-deploy-kernel.ts ──────────────────────────────────────────────────────
// Bước 1: Deploy tokens + Kernel.
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  const network    = (await ethers.provider.getNetwork()).name;
  console.log(`\n🚀  [01] Deploy Kernel — deployer: ${deployer.address}  network: ${network}\n`);

  const vnkr  = await (await ethers.getContractFactory("AXQToken")).deploy(deployer.address);
  await vnkr.waitForDeployment();
  console.log(`  ✅ AXQToken   → ${await vnkr.getAddress()}`);

  const svnkr = await (await ethers.getContractFactory("SAXQToken")).deploy(deployer.address);
  await svnkr.waitForDeployment();
  console.log(`  ✅ sAXQToken  → ${await svnkr.getAddress()}`);

  const gvnkr = await (await ethers.getContractFactory("GAXQToken")).deploy(deployer.address);
  await gvnkr.waitForDeployment();
  console.log(`  ✅ gAXQToken  → ${await gvnkr.getAddress()}`);

  const kernel = await (await ethers.getContractFactory("Kernel")).deploy(deployer.address, deployer.address);
  await kernel.waitForDeployment();
  console.log(`  ✅ Kernel      → ${await kernel.getAddress()}`);

  _save(network, {
    AXVN_TOKEN: await vnkr.getAddress(),
    SAXVN_TOKEN: await svnkr.getAddress(),
    GAXVN_TOKEN: await gvnkr.getAddress(),
    KERNEL: await kernel.getAddress(),
  });
}

function _save(network: string, patch: Record<string, string>) {
  const p = path.resolve(__dirname, "../exports/addresses.json");
  const data: Record<string, Record<string, string>> = fs.existsSync(p)
    ? JSON.parse(fs.readFileSync(p, "utf-8")) : {};
  data[network] = { ...(data[network] ?? {}), ...patch };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`\n  📄 addresses.json updated\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
