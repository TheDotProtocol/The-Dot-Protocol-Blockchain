import Link from 'next/link';
import { notFound } from 'next/navigation';
import DetailRow from '@/components/DetailRow';
import { getBlockByHash, getBlockByNumber } from '@/lib/rpc';
import {
  formatBlockNumber,
  formatGas,
  formatHash,
  formatTimestamp,
  hexToNumber,
  isBlockNumber,
} from '@/lib/format';

type Props = { params: Promise<{ id: string }> };

export default async function BlockPage({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);

  const block = isBlockNumber(decoded)
    ? await getBlockByNumber(parseInt(decoded, 10), true)
    : await getBlockByHash(decoded, true);

  if (!block) notFound();

  const blockNum = hexToNumber(block.number);
  const txs = block.transactions as Array<string | { hash: string }>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-primary">
          ← Back to blocks
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">
          Block {formatBlockNumber(blockNum)}
        </h1>
      </div>

      <div className="glass rounded-xl px-5 py-2 mb-8">
        <dl>
          <DetailRow label="Block Height" value={formatBlockNumber(blockNum)} />
          <DetailRow label="Block Hash" value={block.hash} mono />
          <DetailRow label="Parent Hash" value={block.parentHash} mono href={`/block/${block.parentHash}`} />
          <DetailRow label="Timestamp" value={formatTimestamp(block.timestamp)} />
          <DetailRow label="Validator (Miner)" value={block.miner} mono href={`/address/${block.miner}`} />
          <DetailRow label="Gas Used" value={formatGas(block.gasUsed)} />
          <DetailRow label="Gas Limit" value={formatGas(block.gasLimit)} />
          <DetailRow label="Transactions" value={String(txs.length)} />
          <DetailRow label="Size" value={`${hexToNumber(block.size)} bytes`} />
        </dl>
      </div>

      {txs.length > 0 && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Transactions</h2>
          </div>
          <ul className="divide-y divide-white/5">
            {txs.map((tx) => {
              const hash = typeof tx === 'string' ? tx : tx.hash;
              return (
                <li key={hash} className="px-5 py-3">
                  <Link href={`/tx/${hash}`} className="mono text-sm text-primary hover:underline">
                    {hash}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
