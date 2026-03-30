"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiCheck } from "react-icons/fi";

interface PricingConfig {
  heading: string;
  subtitle: string;
  headingColor: string;
  headingFont: string;
  headingWeight: string;
  headingAccentColor: string;
  subtitleColor: string;
  subtitleFont: string;
  subtitleWeight: string;
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
  cardBgColor: string;
  ctaColor: string;
  ctaFont: string;
  ctaWeight: string;
  ctaBgColor: string;
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

  useEffect(() => {
    if (config && typeof window !== "undefined" && window.location.hash === "#pricing") {
      setTimeout(() => {
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [config]);

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

  // CTA: guest → /login, logged-in with access → dashboard, logged-in without → billing
  let ctaHref = "/login";
  if (isLoggedIn) {
    if (hasAccess) {
      ctaHref = `/u/${session.user.username}/admin`;
    } else {
      ctaHref = `/u/${session.user.username}/admin/billing`;
    }
  }

  let ctaText = config.ctaLabel;
  if (isLoggedIn && hasAccess) {
    ctaText = "Go to Dashboard";
  }

  return (
    <section id="pricing" className="py-20 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl md:text-4xl mb-3 text-center"
          style={{
            color: config.headingColor,
            fontFamily: config.headingFont || undefined,
            fontWeight: Number(config.headingWeight) || 700,
          }}
          dangerouslySetInnerHTML={{
            __html: config.heading.replace(
              /\*([^*]+)\*/g,
              `<span style="color:${config.headingAccentColor}">$1</span>`
            ),
          }}
        />
        <p
          className="mb-10 text-center"
          style={{
            color: config.subtitleColor,
            fontFamily: config.subtitleFont || undefined,
            fontWeight: Number(config.subtitleWeight) || 400,
          }}
        >
          {config.subtitle}
        </p>

        <div className="max-w-2xl mx-auto border border-white/10 rounded-2xl p-8 md:p-10" style={{ backgroundColor: config.cardBgColor || "#181818" }}>
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

          <a
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
          </a>

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
