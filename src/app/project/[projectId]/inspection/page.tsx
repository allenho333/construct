import { prisma } from "@/lib/prisma";
import ProjectDashboard from "../ProjectDashboard";
import { seedProjectTypes } from "@/app/project-actions";

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

    let projectData = project;

    // Self-healing: If no inspection types exist, seed them automatically
    if (projectData.inspectionTypes.length === 0) {

        await seedProjectTypes(projectId, projectData.name);

        // Re-fetch project to get the newly created types
        const updatedProject = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                inspectionInstances: {
                    include: { inspectionType: true },
                    orderBy: { createdAt: 'desc' }
                },
                inspectionTypes: true
            }
        });

        if (updatedProject) {
            projectData = updatedProject;
        }
    }

    return (
        <ProjectDashboard
            project={projectData}
            inspections={projectData.inspectionInstances}
            types={projectData.inspectionTypes}
        />
    );
}
