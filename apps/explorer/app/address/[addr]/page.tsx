import Link from 'next/link';
import { notFound } from 'next/navigation';
import DetailRow from '@/components/DetailRow';
import { CHENNAI } from '@/config/chain';
import {
  getBalance,
  getCode,
  getDpc20Balance,
  getDpc20Standard,
  getTransactionCount,
} from '@/lib/rpc';
import { formatAddress, formatWei, isAddress } from '@/lib/format';

type Props = { params: Promise<{ addr: string }> };

export default async function AddressPage({ params }: Props) {
  const { addr } = await params;
  const address = decodeURIComponent(addr);

  if (!isAddress(address)) notFound();

  const [balance, code, nonce, dpc20Balance, standard] = await Promise.all([
    getBalance(address),
    getCode(address),
    getTransactionCount(address),
    getDpc20Balance(address),
    getDpc20Standard(),
  ]);

  const isContract = code !== '0x' && code.length > 2;
  const isDpc20Contract =
    address.toLowerCase() === CHENNAI.dpc20.address.toLowerCase();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-primary">
          ← Back to explorer
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Address</h1>
        <p className="mono text-xs text-zinc-500 mt-1 break-all">{address}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-zinc-500">Native Balance</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatWei(balance)} <span className="text-primary text-lg">{CHENNAI.currency.symbol}</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1">Gas coin</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-zinc-500">DPC20 Balance</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatWei(dpc20Balance, CHENNAI.dpc20.decimals)}{' '}
            <span className="text-primary text-lg">{CHENNAI.dpc20.symbol}</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1">{standard} token</p>
        </div>
      </div>

      <div className="glass rounded-xl px-5 py-2">
        <dl>
          <DetailRow label="Type" value={isContract ? 'Smart Contract' : 'Externally Owned Account'} />
          <DetailRow label="Transaction Count" value={String(nonce)} />
          {isDpc20Contract && (
            <>
              <DetailRow label="Token Standard" value={CHENNAI.dpc20.standard} />
              <DetailRow label="Symbol" value={CHENNAI.dpc20.symbol} />
              <DetailRow label="Decimals" value={String(CHENNAI.dpc20.decimals)} />
            </>
          )}
          {isContract && !isDpc20Contract && (
            <DetailRow label="Bytecode" value={`${((code.length - 2) / 2).toLocaleString()} bytes`} />
          )}
        </dl>
      </div>

      {isDpc20Contract && (
        <p className="text-sm text-zinc-500 mt-6 text-center">
          This is the official DPC20 contract on Chennai testnet.{' '}
          <Link href="/" className="text-primary hover:underline">
            View latest blocks →
          </Link>
        </p>
      )}
    </div>
  );
}
