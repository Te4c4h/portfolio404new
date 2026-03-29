-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "photoUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showSummary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showExperience" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showEducation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSkills" BOOLEAN NOT NULL DEFAULT true;
