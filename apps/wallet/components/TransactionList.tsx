'use client';

const TRANSACTIONS = [
  { type: 'receive', token: '3DOT', amount: '+1,000,000,000,000', from: '0x84ed...ced56', date: 'Today, 3:45 PM', status: 'confirmed', hash: '0xabc1...def2' },
  { type: 'send', token: 'USDT', amount: '-5,000', to: '0xf39Fd...2266', date: 'Yesterday', status: 'confirmed', hash: '0x1234...5678' },
  { type: 'swap', token: '3DOT → ETH', amount: '100,000 → 0.32', date: '2 days ago', status: 'confirmed', hash: '0xdead...beef' },
  { type: 'receive', token: 'USDC', amount: '+3,000', from: '0x1234...5678', date: '3 days ago', status: 'confirmed', hash: '0xcafe...babe' },
  { type: 'send', token: '3DOT', amount: '-1,000,000', to: '0xabcd...ef01', date: '5 days ago', status: 'confirmed', hash: '0xface...1234' },
  { type: 'pay', token: '3DOT', amount: '-24.99', to: 'CryptoShop', date: '1 week ago', status: 'confirmed', hash: '0xbeef...cafe' },
];

export default function TransactionList() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['All', 'Sent', 'Received', 'Swaps', 'Payments'].map((f) => (
          <button key={f} className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors">
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-sm text-gray-500">
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Token</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 text-sm ${
                    tx.type === 'send' || tx.type === 'pay' ? 'text-red-400' : tx.type === 'receive' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {tx.type === 'send' || tx.type === 'pay' ? '↑' : tx.type === 'receive' ? '↓' : '⇄'}
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-sm">{tx.token}</td>
                <td className="p-4 text-sm font-medium">{tx.amount}</td>
                <td className="p-4 text-sm text-gray-400">{tx.date}</td>
                <td className="p-4">
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full">{tx.status}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm text-gray-400 font-mono cursor-pointer hover:text-orange-400">{tx.hash}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
