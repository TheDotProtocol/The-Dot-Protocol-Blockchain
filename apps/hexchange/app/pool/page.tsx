import PoolCard from "@/components/PoolCard";

export default function PoolPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          Liquidity <span className="text-orange-500">Pools</span>
        </h1>
        <p className="text-gray-400">Provide liquidity and earn trading fees</p>
      </div>
      <PoolCard />
    </div>
  );
}
