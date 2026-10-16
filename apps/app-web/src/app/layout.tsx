import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "AXQ — Wallet & Crypto",
  description: "Ví điện tử, P2P, Crypto và Cashback — AXQ FinTech",
  manifest:    "/manifest.json",
  icons:       { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: {
    title:       "AXQ App",
    description: "Ví điện tử thế hệ mới",
    url:         "https://app.axvn.vn",
    siteName:    "AXQ",
    locale:      "vi_VN",
    type:        "website",
  },
};

export const viewport: Viewport = {
  width:              "device-width",
  initialScale:       1,
  maximumScale:       1,
  themeColor:         "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
