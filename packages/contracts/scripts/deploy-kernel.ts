import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// ─── deploy-kernel.ts ─────────────────────────────────────────────────────────
// Deploy AXQToken + Kernel, then save addresses to exports/addresses.json.
// Run: hardhat run scripts/deploy-kernel.ts --network <network>
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\n🚀  Deploying Kernel — deployer: ${deployer.address}`);
  console.log(`    Network: ${(await ethers.provider.getNetwork()).name}\n`);

  // ── 1. Deploy AXQ token ────────────────────────────────────────────────
  const AXQToken = await ethers.getContractFactory("AXQToken");
  const vnkr      = await AXQToken.deploy(deployer.address);
  await vnkr.waitForDeployment();
  console.log(`  ✅ AXQToken    → ${await vnkr.getAddress()}`);

  // ── 2. Deploy sAXQ token ───────────────────────────────────────────────
  const SAXQToken = await ethers.getContractFactory("SAXQToken");
  const svnkr      = await SAXQToken.deploy(deployer.address);
  await svnkr.waitForDeployment();
  console.log(`  ✅ SAXQToken   → ${await svnkr.getAddress()}`);

  // ── 3. Deploy gAXQ token ───────────────────────────────────────────────
  const GAXQToken = await ethers.getContractFactory("GAXQToken");
  const gvnkr      = await GAXQToken.deploy(deployer.address);
  await gvnkr.waitForDeployment();
  console.log(`  ✅ GAXQToken   → ${await gvnkr.getAddress()}`);

  // ── 4. Deploy Kernel ────────────────────────────────────────────────────
  const Kernel = await ethers.getContractFactory("Kernel");
  const kernel = await Kernel.deploy(deployer.address, deployer.address);
  await kernel.waitForDeployment();
  console.log(`  ✅ Kernel       → ${await kernel.getAddress()}`);

  // ── 5. Persist addresses ────────────────────────────────────────────────
  const network = (await ethers.provider.getNetwork()).name;
  const outPath  = path.resolve(__dirname, "../exports/addresses.json");
  let existing: Record<string, Record<string, string>> = {};
  if (fs.existsSync(outPath)) {
    existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
  }

  existing[network] = {
    ...(existing[network] ?? {}),
    AXVN_TOKEN:  await vnkr.getAddress(),
    SAXVN_TOKEN: await svnkr.getAddress(),
    GAXVN_TOKEN: await gvnkr.getAddress(),
    KERNEL:      await kernel.getAddress(),
  };

  fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
  console.log(`\n  📄 Addresses saved → exports/addresses.json\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
