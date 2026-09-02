import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3Dot Pay — Crypto Payment Gateway",
  description: "Accept crypto payments with 3Dot Pay. Merchant tools, QR codes, and instant settlement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#05080f] text-white min-h-screen">{children}</body>
    </html>
  );
}
