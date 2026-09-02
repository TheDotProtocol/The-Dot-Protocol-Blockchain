'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { classifySearch } from '@/lib/format';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = query.trim();
    if (!trimmed) return;

    const kind = classifySearch(trimmed);
    if (kind === 'address') {
      router.push(`/address/${trimmed}`);
      return;
    }
    if (kind === 'block') {
      router.push(`/block/${trimmed}`);
      return;
    }
    if (kind === 'hash') {
      router.push(`/tx/${trimmed}`);
      return;
    }

    setError('Enter a block number, address (0x…40), or tx/block hash (0x…64)');
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by block, address, or tx hash"
          className="flex-1 px-4 py-3 rounded-xl bg-zinc-900/80 border border-white/8 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 mono text-sm"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          Search
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </form>
  );
}
