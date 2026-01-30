import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InspectionForm from "@/components/InspectionForm";


import ReportActions from "@/components/ReportActions";

export const dynamic = "force-dynamic";

export default async function InstancePage({
    params,
}: {
    params: Promise<{ projectId: string; instanceId: string }>;
}) {
    const { projectId, instanceId } = await params;

    const instance = await prisma.inspectionInstance.findUnique({
        where: { id: instanceId },
        include: {
            inspectionType: {
                include: {
                    nodeTemplates: {
                        orderBy: { orderIndex: "asc" },
                    },
                },
            },
            nodeResults: true,
        },
    });

    if (!instance) {
        notFound();
    }

    // Create a map of results for easy access
    const resultsMap = new Map(instance.nodeResults.map((r) => [r.nodeTemplateId, r]));

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: "0.5rem" }}>
                    <h1 style={{ margin: 0 }}>{instance.inspectionType.name}</h1>
                    {/* <ReportActions projectId={projectId} instanceId={instanceId} /> */}
                </div>

                {/* Header is now handled inside InspectionForm */}

                {/* Header is now handled inside InspectionForm */}
            </div>


            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <InspectionForm
                    nodes={instance.inspectionType.nodeTemplates}
                    initialResults={instance.nodeResults}
                    headerMetadata={{
                        itpNumber: instance.itpNumber,
                        status: instance.status,
                        locationReference: instance.locationReference,
                        itemReference: instance.itemReference
                    }}
                    projectId={projectId}
                    instanceId={instanceId}
                />
            </div>
        </div>
    );
}
