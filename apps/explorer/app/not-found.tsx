import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Not Found</h1>
      <p className="text-zinc-500 mb-6">Block, transaction, or address not found on Chennai testnet.</p>
      <Link href="/" className="text-primary hover:underline">
        ← Back to explorer
      </Link>
    </div>
  );
}
