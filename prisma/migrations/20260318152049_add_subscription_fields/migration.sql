-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "isFreeAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
ALTER COLUMN "isPublished" SET DEFAULT true;
