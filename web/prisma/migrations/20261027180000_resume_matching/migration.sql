ALTER TABLE "Profile"
  ADD COLUMN "resumeSummary" TEXT,
  ADD COLUMN "resumeContact" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "resumeEducation" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "resumeExperience" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "resumeProjects" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "resumeLanguages" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "resumeLinks" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "workArrangement" TEXT,
  ADD COLUMN "relocationWillingness" BOOLEAN,
  ADD COLUMN "startAvailability" TEXT,
  ADD COLUMN "internshipDuration" TEXT,
  ADD COLUMN "profileVersion" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Internship"
  ADD COLUMN "matchingRequirements" JSONB NOT NULL DEFAULT '[]';
