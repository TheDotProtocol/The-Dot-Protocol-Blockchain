import P2PCard from "@/components/P2PCard";

export default function P2PPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          P2P <span className="text-orange-500">Trading</span>
        </h1>
        <p className="text-gray-400">Peer-to-peer trading with smart contract escrow protection</p>
      </div>
      <P2PCard />
    </div>
  );
}
