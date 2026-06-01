-- AlterTable
ALTER TABLE "ResumeSkill" ADD COLUMN "percent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN "interests" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Resume" ADD COLUMN "showLanguages" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Resume" ADD COLUMN "showCertifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Resume" ADD COLUMN "showAwards" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Resume" ADD COLUMN "showInterests" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ResumeLanguage" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeCertification" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "issuer" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeAward" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "issuer" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeAward_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResumeLanguage" ADD CONSTRAINT "ResumeLanguage_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeCertification" ADD CONSTRAINT "ResumeCertification_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAward" ADD CONSTRAINT "ResumeAward_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
