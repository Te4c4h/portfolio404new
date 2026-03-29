"use client";

import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import Link from "next/link";

interface PricingConfig {
  price: string;
  period: string;
  tagline: string;
  features: string;
  ctaLabel: string;
}

export default function PricingSection() {
  const [config, setConfig] = useState<PricingConfig | null>(null);

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  if (!config) return null;

  const featureList = config.features
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <section id="pricing" className="py-20 px-4 border-t border-white/5">
      <div className="max-w-lg mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Simple, <span className="text-[#70E844]">Honest</span> Pricing
        </h2>
        <p className="text-gray-400 mb-10">No subscriptions. No surprises.</p>

        <div className="bg-[#181818] border border-white/10 rounded-2xl p-8">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-5xl font-bold text-white">{config.price}</span>
            <span className="text-gray-400 text-lg">{config.period}</span>
          </div>
          <p className="text-gray-400 text-sm mb-8">{config.tagline}</p>

          <ul className="space-y-3 mb-8 text-left">
            {featureList.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <FiCheck size={16} className="text-[#70E844] flex-shrink-0" />
                <span className="text-gray-200 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="block w-full py-3 bg-[#70E844] text-[#131313] font-bold rounded-xl hover:opacity-90 transition text-center"
          >
            {config.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
