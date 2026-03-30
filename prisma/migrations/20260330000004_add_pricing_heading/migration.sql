-- AlterTable
ALTER TABLE "PricingConfig" ADD COLUMN "heading" TEXT NOT NULL DEFAULT 'Simple, *Honest* Pricing';
ALTER TABLE "PricingConfig" ADD COLUMN "subtitle" TEXT NOT NULL DEFAULT 'No subscriptions. No surprises.';
ALTER TABLE "PricingConfig" ADD COLUMN "headingColor" TEXT NOT NULL DEFAULT '#ffffff';
ALTER TABLE "PricingConfig" ADD COLUMN "headingFont" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PricingConfig" ADD COLUMN "headingWeight" TEXT NOT NULL DEFAULT '700';
ALTER TABLE "PricingConfig" ADD COLUMN "headingAccentColor" TEXT NOT NULL DEFAULT '#70E844';
ALTER TABLE "PricingConfig" ADD COLUMN "subtitleColor" TEXT NOT NULL DEFAULT '#9ca3af';
ALTER TABLE "PricingConfig" ADD COLUMN "subtitleFont" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PricingConfig" ADD COLUMN "subtitleWeight" TEXT NOT NULL DEFAULT '400';
ALTER TABLE "PricingConfig" DROP COLUMN IF EXISTS "ctaAction";
