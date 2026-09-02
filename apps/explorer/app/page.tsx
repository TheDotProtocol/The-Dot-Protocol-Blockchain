import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import ChainStats from '@/components/ChainStats';
import BlocksTable from '@/components/BlocksTable';

export default function ExplorerHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Chennai Testnet Explorer
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          Blocks, transactions, addresses, and DPC20 token balances on Dot Protocol
        </p>
        <SearchBar />
      </div>

      <div className="mb-8">
        <Suspense fallback={<StatsSkeleton />}>
          <ChainStats />
        </Suspense>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <BlocksTable />
      </Suspense>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-xl h-16 animate-pulse" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return <div className="glass rounded-xl h-96 animate-pulse" />;
}
