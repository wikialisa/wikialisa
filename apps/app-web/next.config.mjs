/** @type {import('next').NextConfig} */
import { readFileSync } from "fs";

// WSL1: disable webpack disk cache để tránh ENOENT rename error
const isWSL = (() => {
  try { return /microsoft/i.test(readFileSync("/proc/version", "utf8")); }
  catch { return false; }
})();

const nextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  transpilePackages: ["@wikialisa/ui-kit"],
  ...(isWSL && {
    webpack(config) {
      config.cache = false;
      return config;
    },
  }),
};

export default nextConfig;
