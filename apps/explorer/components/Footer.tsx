import { CHENNAI } from '@/config/chain';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
        <p>Dot Protocol Scan · {CHENNAI.name}</p>
        <p className="mono">Chain ID {CHENNAI.chainId} · RPC {CHENNAI.rpcUrl}</p>
      </div>
    </footer>
  );
}
