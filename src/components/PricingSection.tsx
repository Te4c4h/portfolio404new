"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiCheck } from "react-icons/fi";
import Link from "next/link";

interface PricingConfig {
  price: string;
  period: string;
  tagline: string;
  features: string;
  ctaLabel: string;
  priceColor: string;
  priceFont: string;
  priceWeight: string;
  periodColor: string;
  periodFont: string;
  periodWeight: string;
  taglineColor: string;
  taglineFont: string;
  taglineWeight: string;
  featuresColor: string;
  featuresFont: string;
  featuresWeight: string;
  featuresMarkColor: string;
  ctaColor: string;
  ctaFont: string;
  ctaWeight: string;
  ctaBgColor: string;
  ctaAction: string;
}

export default function PricingSection() {
  const { data: session } = useSession();
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

  const isLoggedIn = !!session?.user;
  const isPaid = session?.user?.isPaid === true;
  const isFreeAccess = session?.user?.isFreeAccess === true;
  const isAdmin = session?.user?.isAdmin === true;
  const hasAccess = isPaid || isFreeAccess || isAdmin;

  // Determine CTA link based on action config + auth state
  let ctaHref = "/register";
  if (isLoggedIn) {
    if (hasAccess) {
      ctaHref = `/u/${session.user.username}/admin`;
    } else if (config.ctaAction === "payment") {
      ctaHref = `/u/${session.user.username}/admin/billing`;
    } else {
      ctaHref = `/u/${session.user.username}/admin/billing`;
    }
  } else {
    ctaHref = "/login";
  }

  // Determine CTA label based on state
  let ctaText = config.ctaLabel;
  if (isLoggedIn && hasAccess) {
    ctaText = "Go to Dashboard";
  }

  return (
    <section id="pricing" className="py-20 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">
          Simple, <span className="text-[#70E844]">Honest</span> Pricing
        </h2>
        <p className="text-gray-400 mb-10 text-center">No subscriptions. No surprises.</p>

        <div className="max-w-2xl mx-auto bg-[#181818] border border-white/10 rounded-2xl p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span
                className="text-5xl md:text-6xl"
                style={{
                  color: config.priceColor,
                  fontFamily: config.priceFont || undefined,
                  fontWeight: Number(config.priceWeight) || 700,
                }}
              >
                {config.price}
              </span>
              <span
                className="text-lg md:text-xl"
                style={{
                  color: config.periodColor,
                  fontFamily: config.periodFont || undefined,
                  fontWeight: Number(config.periodWeight) || 400,
                }}
              >
                {config.period}
              </span>
            </div>
            <p
              className="text-sm md:text-base"
              style={{
                color: config.taglineColor,
                fontFamily: config.taglineFont || undefined,
                fontWeight: Number(config.taglineWeight) || 400,
              }}
            >
              {config.tagline}
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            {featureList.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <FiCheck
                  size={18}
                  className="flex-shrink-0"
                  style={{ color: config.featuresMarkColor }}
                />
                <span
                  className="text-sm md:text-base"
                  style={{
                    color: config.featuresColor,
                    fontFamily: config.featuresFont || undefined,
                    fontWeight: Number(config.featuresWeight) || 400,
                  }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={ctaHref}
            className="block w-full py-3.5 rounded-xl hover:opacity-90 transition text-center"
            style={{
              backgroundColor: config.ctaBgColor,
              color: config.ctaColor,
              fontFamily: config.ctaFont || undefined,
              fontWeight: Number(config.ctaWeight) || 700,
            }}
          >
            {ctaText}
          </Link>

          {!isLoggedIn && (
            <p className="text-gray-500 text-xs text-center mt-3">
              Sign in or create an account to get started
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
