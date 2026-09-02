import { CHENNAI } from '@/config/chain';
import { getChainStatus } from '@/lib/rpc';
import { formatBlockNumber } from '@/lib/format';

export default async function ChainStats() {
  const status = await getChainStatus();

  const items = [
    {
      label: 'Network',
      value: status.online ? 'Online' : 'Offline',
      accent: status.online ? 'text-green-400' : 'text-red-400',
    },
    { label: 'Chain ID', value: String(status.chainId) },
    { label: 'Latest Block', value: formatBlockNumber(status.blockNumber) },
    { label: 'Peers', value: String(status.peerCount) },
    { label: 'Validators', value: String(CHENNAI.validators) },
    { label: 'Token Standard', value: CHENNAI.dpc20.standard },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <div key={item.label} className="glass rounded-xl px-4 py-3">
          <p className="text-xs text-zinc-500">{item.label}</p>
          <p className={`text-sm font-semibold mt-1 ${item.accent ?? 'text-white'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
