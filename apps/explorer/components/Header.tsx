import Link from 'next/link';
import { CHENNAI } from '@/config/chain';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0b0d]/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-white">
            DP
          </span>
          <div>
            <span className="font-semibold text-white text-sm">Dot Protocol Scan</span>
            <span className="hidden sm:inline text-zinc-600 text-xs ml-2">Chennai Testnet</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-400 hover:text-primary transition-colors">
            Blocks
          </Link>
          <Link
            href={`/address/${CHENNAI.dpc20.address}`}
            className="text-zinc-400 hover:text-primary transition-colors hidden sm:inline"
          >
            DPC20 Contract
          </Link>
          <a
            href={CHENNAI.websiteUrl}
            className="text-zinc-500 hover:text-primary transition-colors"
          >
            ← Website
          </a>
        </nav>
      </div>
    </header>
  );
}
