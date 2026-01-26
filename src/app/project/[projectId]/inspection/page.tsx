import { prisma } from "@/lib/prisma";
import ProjectDashboard from "../ProjectDashboard";

export default async function InspectionPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            inspectionInstances: {
                include: { inspectionType: true },
                orderBy: { createdAt: 'desc' }
            },
            inspectionTypes: true
        }
    });

    if (!project) return <div>Project not found</div>;

    return (
        <ProjectDashboard
            project={project}
            inspections={project.inspectionInstances}
            types={project.inspectionTypes}
        />
    );
}
