"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInspection(projectId: string, inspectionTypeId: string) {
    // 1. Get the inspection type details (to generate ITP number properly if strict, but we'll generic it for now)
    const inspectionType = await prisma.inspectionType.findUnique({
        where: { id: inspectionTypeId }
    });

    if (!inspectionType) {
        throw new Error("Inspection Type not found");
    }

    // 2. Generate a simple ITP number (e.g., P-{ID}-T-{Code}-RANDOM)
    // In a real app, this would be an atomic increment or sophisticated logic.
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const itpNumber = `${inspectionType.sectionCode || "ITP"}-${randomSuffix}`;

    // 3. Create the instance
    const newInstance = await prisma.inspectionInstance.create({
        data: {
            projectId,
            inspectionTypeId,
            itpNumber: itpNumber,
            locationReference: "New Location", // Default placeholder
            itemReference: "New Item",         // Default placeholder
            status: "Open"
        }
    });

    // 4. Create initial empty results for all nodes in this type?
    // Not strictly necessary if the form handles "missing" results gracefully (which it does),
    // but good practice if we want them to exist in DB immediately.
    // The current form implementation handles missing results by showing "Pending".
    // So we can skip pre-populating NodeResults for now.

    // 5. Revalidate and Redirect
    revalidatePath(`/project/${projectId}`);
    redirect(`/project/${projectId}/${newInstance.id}`);
}
