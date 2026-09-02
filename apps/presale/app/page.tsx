'use client';

import { useState } from 'react';
import PurchasePanel from '@/components/PurchasePanel';
import SaleDetails from '@/components/SaleDetails';
import Roadmap from '@/components/Roadmap';
import FAQ from '@/components/FAQ';

export default function PresalePage() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-orange-500">3DOT</span> Token Presale
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          The future of decentralized exchanges. Buy 3DOT tokens early and join the Dot Protocol ecosystem.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Purchase Panel */}
        <div className="w-full lg:w-1/2">
          <PurchasePanel />
        </div>

        {/* Right: Sale Details */}
        <div className="w-full lg:w-1/2">
          <SaleDetails />
        </div>
      </div>

      {/* Roadmap */}
      <div className="mt-16">
        <Roadmap />
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <FAQ />
      </div>
    </div>
  );
}
