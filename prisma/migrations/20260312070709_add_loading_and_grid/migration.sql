-- AlterTable
ALTER TABLE "SiteContent" ADD COLUMN     "loadingHeading" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "loadingSubtitle" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "gridColor" TEXT NOT NULL DEFAULT 'rgba(255,255,255,0.03)';
