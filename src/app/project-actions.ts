"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export type ProjectResult = {
    success: boolean;
    error?: string;
    projectId?: string;
};

// Helper to seed inspection types
export async function seedProjectTypes(projectId: string, projectName?: string) {
    try {
        const formsDir = path.join(process.cwd(), 'src/config/forms');

        if (fs.existsSync(formsDir)) {
            const formFiles = fs.readdirSync(formsDir).filter(file => file.endsWith('.json'));

            for (const file of formFiles) {
                const filePath = path.join(formsDir, file);
                const formsConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                for (const form of formsConfig) {
                    await prisma.inspectionType.create({
                        data: {
                            projectId: projectId,
                            name: form.name,
                            sectionCode: form.sectionCode,
                            nodeTemplates: {
                                create: form.nodes.map((node: any, index: number) => ({
                                    name: node.name,
                                    description: node.description,
                                    inputType: node.inputType || "text",
                                    options: node.options ? JSON.stringify(node.options) : null,
                                    orderIndex: node.orderIndex || index
                                }))
                            }
                        }
                    });
                }
            }
            if (projectName) {
                console.log(`Created default inspection types for project: ${projectName}`);
            }
            return true;
        }
    } catch (error) {
        console.warn("Failed to create default inspection types:", error);
        // Don't throw, just log
        return false;
    }
}

export async function createProject(formData: FormData): Promise<ProjectResult> {
    try {
        const name = formData.get("name") as string;
        const location = formData.get("location") as string;
        const responsible = formData.get("responsible") as string;

        if (!name) {
            return { success: false, error: "Project Name is required" };
        }

        // Auto-generate Project ID (e.g. "001", "002")
        const count = await prisma.project.count();
        const code = (count + 1).toString().padStart(3, '0');

        const project = await prisma.project.create({
            data: {
                name,
                code,
                location: location || null,
                responsible: responsible || null,
            },
        });

        // Auto-create default inspection types
        await seedProjectTypes(project.id, project.name);

        revalidatePath("/");

        return { success: true, projectId: project.id };
    } catch (e) {
        console.error("Failed to create project:", e);
        return { success: false, error: "Database error occurred" };
    }
}

export async function deleteProject(projectId: string): Promise<ProjectResult> {
    try {
        // Delete in the correct order to avoid foreign key constraints
        // 1. Delete all inspection node results
        await prisma.inspectionNodeResult.deleteMany({
            where: {
                instance: {
                    projectId
                }
            }
        });

        // 2. Delete all inspection instances
        await prisma.inspectionInstance.deleteMany({
            where: { projectId }
        });

        // 3. Delete all inspection node templates
        await prisma.inspectionNodeTemplate.deleteMany({
            where: {
                inspectionType: {
                    projectId
                }
            }
        });

        // 4. Delete all inspection types
        await prisma.inspectionType.deleteMany({
            where: { projectId }
        });

        // 5. Finally delete the project
        await prisma.project.delete({
            where: { id: projectId }
        });

        revalidatePath("/project");

        return { success: true };
    } catch (e) {
        console.error("Failed to delete project:", e);
        return { success: false, error: "Failed to delete project" };
    }
}
