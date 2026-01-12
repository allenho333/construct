import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InspectionForm from "@/components/InspectionForm";

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
                <h1 style={{ marginBottom: "0.5rem" }}>{instance.inspectionType.name}</h1>
                <div style={{ padding: "1rem", background: "var(--secondary)", borderRadius: "var(--radius)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.9rem" }}>
                        <div>
                            <div style={{ opacity: 0.7 }}>ITP Number</div>
                            <div style={{ fontWeight: 600 }}>{instance.itpNumber}</div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.7 }}>Status</div>
                            <div style={{ fontWeight: 600 }}>{instance.status}</div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.7 }}>Location</div>
                            <div style={{ fontWeight: 600 }}>{instance.locationReference}</div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.7 }}>ItemRef</div>
                            <div style={{ fontWeight: 600 }}>{instance.itemReference}</div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 style={{ marginBottom: "1rem" }}>Checklist</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <InspectionForm
                    nodes={instance.inspectionType.nodeTemplates}
                    initialResults={instance.nodeResults}
                />
            </div>
        </div>
    );
}
