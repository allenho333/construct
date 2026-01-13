"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProjectResult = {
    success: boolean;
    error?: string;
    projectId?: string;
};

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
                // Create a default user reference if needed, otherwise rely on schema defaults
            },
        });

        revalidatePath("/");

        return { success: true, projectId: project.id };
    } catch (e) {
        console.error("Failed to create project:", e);
        return { success: false, error: "Database error occurred" };
    }
}
