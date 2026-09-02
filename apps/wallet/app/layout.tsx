import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3Dot Wallet - Your Crypto Wallet",
  description: "Manage your crypto assets with 3Dot Wallet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e17] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
