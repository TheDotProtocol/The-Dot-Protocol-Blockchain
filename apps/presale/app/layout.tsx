import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3DOT Presale - Dot Protocol",
  description: "Join the 3DOT token presale on Dot Protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e17] text-white min-h-screen">
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-orange-500">3DOT</span>
            <span className="text-xl font-semibold">Presale</span>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Connect Wallet
          </button>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
