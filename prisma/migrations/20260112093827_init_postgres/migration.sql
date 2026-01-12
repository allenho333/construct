-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "assignees" TEXT,
    "responsible" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionType" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "sectionCode" TEXT,

    CONSTRAINT "InspectionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionNodeTemplate" (
    "id" TEXT NOT NULL,
    "inspectionTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputType" TEXT NOT NULL DEFAULT 'text',
    "options" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InspectionNodeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionInstance" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "inspectionTypeId" TEXT NOT NULL,
    "itpNumber" TEXT,
    "locationReference" TEXT,
    "itemReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionNodeResult" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "nodeTemplateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "value" TEXT,
    "comments" TEXT,
    "photoUrls" TEXT,

    CONSTRAINT "InspectionNodeResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InspectionType" ADD CONSTRAINT "InspectionType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionNodeTemplate" ADD CONSTRAINT "InspectionNodeTemplate_inspectionTypeId_fkey" FOREIGN KEY ("inspectionTypeId") REFERENCES "InspectionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionInstance" ADD CONSTRAINT "InspectionInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionInstance" ADD CONSTRAINT "InspectionInstance_inspectionTypeId_fkey" FOREIGN KEY ("inspectionTypeId") REFERENCES "InspectionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionNodeResult" ADD CONSTRAINT "InspectionNodeResult_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "InspectionInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionNodeResult" ADD CONSTRAINT "InspectionNodeResult_nodeTemplateId_fkey" FOREIGN KEY ("nodeTemplateId") REFERENCES "InspectionNodeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
