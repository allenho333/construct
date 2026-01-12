-- AlterTable
ALTER TABLE "InspectionNodeResult" ADD COLUMN "value" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InspectionNodeTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputType" TEXT NOT NULL DEFAULT 'text',
    "options" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InspectionNodeTemplate_inspectionTypeId_fkey" FOREIGN KEY ("inspectionTypeId") REFERENCES "InspectionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InspectionNodeTemplate" ("description", "id", "inspectionTypeId", "name", "orderIndex") SELECT "description", "id", "inspectionTypeId", "name", "orderIndex" FROM "InspectionNodeTemplate";
DROP TABLE "InspectionNodeTemplate";
ALTER TABLE "new_InspectionNodeTemplate" RENAME TO "InspectionNodeTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
