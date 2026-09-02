import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard — The Dot Protocol",
  description: "Monitor contracts, manage users, and oversee the Dot Protocol ecosystem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#05080f] text-white min-h-screen">{children}</body>
    </html>
  );
}
