import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectShell from "./ProjectShell";

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            inspectionTypes: true, // Fetch available types
            inspectionInstances: {
                include: {
                    inspectionType: true,
                },
            },
        },
    });

    if (!project) {
        notFound();
    }

    return (
        <ProjectShell
            projectName={project.name}
            projectId={project.id}
            instances={project.inspectionInstances}
            inspectionTypes={project.inspectionTypes}
        >
            {children}
        </ProjectShell>
    );
}

