-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "assignees" TEXT,
    "responsible" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InspectionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "sectionCode" TEXT,
    CONSTRAINT "InspectionType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionNodeTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InspectionNodeTemplate_inspectionTypeId_fkey" FOREIGN KEY ("inspectionTypeId") REFERENCES "InspectionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "inspectionTypeId" TEXT NOT NULL,
    "itpNumber" TEXT,
    "locationReference" TEXT,
    "itemReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InspectionInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InspectionInstance_inspectionTypeId_fkey" FOREIGN KEY ("inspectionTypeId") REFERENCES "InspectionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionNodeResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instanceId" TEXT NOT NULL,
    "nodeTemplateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "comments" TEXT,
    "photoUrls" TEXT,
    CONSTRAINT "InspectionNodeResult_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "InspectionInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InspectionNodeResult_nodeTemplateId_fkey" FOREIGN KEY ("nodeTemplateId") REFERENCES "InspectionNodeTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
