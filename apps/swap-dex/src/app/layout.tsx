import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AXQ Swap",
  description: "AMM DEX & Cross-chain Liquidity Router — AXQ Global Ventures Pte. Ltd.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
