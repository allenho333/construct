-- AlterTable
ALTER TABLE "Project" ADD COLUMN "code" TEXT;

-- AlterTable
ALTER TABLE "InspectionNodeTemplate" ADD COLUMN "inputType" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN "options" TEXT,
ADD COLUMN "orderIndex" INTEGER NOT NULL DEFAULT 0;
