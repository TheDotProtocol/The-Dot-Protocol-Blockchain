import Link from 'next/link';
import { getLatestBlocks } from '@/lib/rpc';
import {
  formatBlockNumber,
  formatGas,
  formatHash,
  formatTimestamp,
  hexToNumber,
} from '@/lib/format';

export default async function BlocksTable() {
  let blocks: Awaited<ReturnType<typeof getLatestBlocks>> = [];
  let error = '';

  try {
    blocks = await getLatestBlocks(20);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load blocks';
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-red-400 mb-2">Cannot connect to Chennai RPC</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <p className="text-zinc-600 text-xs mt-4">Run: npm run chain:chennai:up</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="font-semibold text-white">Latest Blocks</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs border-b border-white/5">
              <th className="text-left px-5 py-3 font-medium">Block</th>
              <th className="text-left px-5 py-3 font-medium">Hash</th>
              <th className="text-left px-5 py-3 font-medium">Txs</th>
              <th className="text-left px-5 py-3 font-medium">Gas Used</th>
              <th className="text-left px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => {
              const num = hexToNumber(block.number);
              const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
              return (
                <tr
                  key={block.hash}
                  className="border-b border-white/3 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/block/${num}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {formatBlockNumber(num)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 mono text-zinc-400 text-xs">
                    <Link href={`/block/${block.hash}`} className="hover:text-primary">
                      {formatHash(block.hash)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-300">{txCount}</td>
                  <td className="px-5 py-3 text-zinc-400">{formatGas(block.gasUsed)}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {formatTimestamp(block.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
