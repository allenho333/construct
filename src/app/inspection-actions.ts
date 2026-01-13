"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitInspection(instanceId: string, projectId: string) {
    try {
        // 1. Check if already submitted (optional, but good practice)
        const existing = await prisma.inspectionInstance.findUnique({
            where: { id: instanceId },
            select: { itpNumber: true }
        });

        if (existing?.itpNumber) {
            return { success: false, error: "Inspection already submitted" };
        }

        // 2. Generate Random ITP Number
        // Format: ITP-[Timestamp]-[Random4Chars]
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        const itpNumber = `ITP-${timestamp}-${random}`;

        // 3. Update Instance
        await prisma.inspectionInstance.update({
            where: { id: instanceId },
            data: {
                itpNumber: itpNumber,
                status: "Submitted" // Mark as submitted/closed
            }
        });

        // 4. Revalidate to update UI
        revalidatePath(`/project/${projectId}/${instanceId}`);

        return { success: true, itpNumber };
    } catch (error) {
        console.error("Failed to submit inspection:", error);
    }
}

export async function saveNodeResult(
    instanceId: string,
    nodeTemplateId: string,
    value: any,
    status: string
) {
    try {
        const valueStr = JSON.stringify(value);

        const existing = await prisma.inspectionNodeResult.findFirst({
            where: {
                instanceId,
                nodeTemplateId
            }
        });

        if (existing) {
            await prisma.inspectionNodeResult.update({
                where: { id: existing.id },
                data: {
                    value: valueStr,
                    status
                }
            });
        } else {
            await prisma.inspectionNodeResult.create({
                data: {
                    instanceId,
                    nodeTemplateId,
                    value: valueStr,
                    status
                }
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to save node result:", error);
        return { success: false, error: "Failed to save" };
    }
}
