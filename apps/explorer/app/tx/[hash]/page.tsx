import Link from 'next/link';
import { notFound } from 'next/navigation';
import DetailRow from '@/components/DetailRow';
import { getTransaction, getTransactionReceipt } from '@/lib/rpc';
import {
  formatAddress,
  formatBlockNumber,
  formatGas,
  formatHash,
  formatWei,
  hexToNumber,
} from '@/lib/format';

type Props = { params: Promise<{ hash: string }> };

export default async function TransactionPage({ params }: Props) {
  const { hash } = await params;
  const decoded = decodeURIComponent(hash);

  const tx = await getTransaction(decoded);

  if (!tx) {
    const { getBlockByHash } = await import('@/lib/rpc');
    const block = await getBlockByHash(decoded, false);
    if (block) {
      const { redirect } = await import('next/navigation');
      redirect(`/block/${decoded}`);
    }
    notFound();
  }

  const receipt = await getTransactionReceipt(decoded);

  const blockNum = hexToNumber(tx.blockNumber);
  const status = receipt
    ? receipt.status === '0x1'
      ? 'Success'
      : 'Failed'
    : 'Pending';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-primary">
          ← Back to explorer
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Transaction</h1>
        <p className="mono text-xs text-zinc-500 mt-1 break-all">{decoded}</p>
      </div>

      <div className="glass rounded-xl px-5 py-2 mb-8">
        <dl>
          <DetailRow
            label="Status"
            value={
              <span className={status === 'Success' ? 'text-green-400' : status === 'Failed' ? 'text-red-400' : 'text-amber-400'}>
                {status}
              </span>
            }
          />
          <DetailRow label="Block" value={formatBlockNumber(blockNum)} href={`/block/${blockNum}`} />
          <DetailRow label="From" value={formatAddress(tx.from)} mono href={`/address/${tx.from}`} />
          <DetailRow
            label="To"
            value={tx.to ? formatAddress(tx.to) : 'Contract Creation'}
            mono
            href={tx.to ? `/address/${tx.to}` : undefined}
          />
          <DetailRow label="Value" value={`${formatWei(tx.value)} TDOT`} />
          <DetailRow label="Gas Price" value={formatGas(tx.gasPrice)} />
          <DetailRow label="Gas Limit" value={formatGas(tx.gas)} />
          {receipt && <DetailRow label="Gas Used" value={formatGas(receipt.gasUsed)} />}
          <DetailRow label="Nonce" value={String(hexToNumber(tx.nonce))} />
          <DetailRow label="Input Data" value={tx.input === '0x' ? '0x' : formatHash(tx.input, 16)} mono />
        </dl>
      </div>

      {receipt && receipt.logs.length > 0 && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Event Logs ({receipt.logs.length})</h2>
            <p className="text-xs text-zinc-500 mt-1">DPC20 transfers and contract events appear here</p>
          </div>
          <ul className="divide-y divide-white/5">
            {receipt.logs.map((log, i) => (
              <li key={i} className="px-5 py-4 text-sm">
                <p className="text-zinc-500 text-xs mb-1">Log #{i}</p>
                <p className="mono text-xs text-zinc-400 break-all">
                  Contract:{' '}
                  <Link href={`/address/${log.address}`} className="text-primary hover:underline">
                    {log.address}
                  </Link>
                </p>
                {log.topics[0] && (
                  <p className="mono text-xs text-zinc-500 mt-1 break-all">
                    Topic[0]: {log.topics[0]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
