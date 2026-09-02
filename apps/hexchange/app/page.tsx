import SwapCard from "@/components/SwapCard";
import OrderBook from "@/components/OrderBook";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SwapCard />
      </div>
      <div>
        <OrderBook />
      </div>
    </div>
  );
}
