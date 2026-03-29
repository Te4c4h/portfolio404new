CREATE TABLE IF NOT EXISTS "PricingConfig" (
  "id"        TEXT NOT NULL,
  "price"     TEXT NOT NULL DEFAULT '$5',
  "period"    TEXT NOT NULL DEFAULT 'one-time',
  "tagline"   TEXT NOT NULL DEFAULT 'Pay once. Lifetime access. No recurring charges.',
  "features"  TEXT NOT NULL DEFAULT 'Live public portfolio
Resume builder & downloads
Custom themes & colors
Built-in analytics
Contact links & nav
Lifetime access',
  "ctaLabel"  TEXT NOT NULL DEFAULT 'Get Started',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);
