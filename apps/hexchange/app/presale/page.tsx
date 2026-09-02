import PresaleCard from "@/components/PresaleCard";

export default function PresalePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-orange-500">3DOT</span> Presale
        </h1>
        <p className="text-gray-400">
          Secure your allocation in the Dot Protocol token presale
        </p>
      </div>
      <PresaleCard />
    </div>
  );
}
