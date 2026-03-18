/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Theme` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "codeContent" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "codeLanguage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'project',
ADD COLUMN     "modelUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "videoUrl" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SiteContent" ADD COLUMN     "logoUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "useLogoImage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "logoUrl";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT,
ALTER COLUMN "password" SET DEFAULT '';

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT 'classic',
    "fullName" TEXT NOT NULL DEFAULT '',
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "showOnPortfolio" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeExperience" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEducation" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "school" TEXT NOT NULL DEFAULT '',
    "degree" TEXT NOT NULL DEFAULT '',
    "field" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_key" ON "Resume"("userId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperience" ADD CONSTRAINT "ResumeExperience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducation" ADD CONSTRAINT "ResumeEducation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
