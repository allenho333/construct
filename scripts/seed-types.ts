
import { PrismaClient } from '@prisma/client';
import windowsForm from '../src/config/forms/windows.json';

const prisma = new PrismaClient();

async function main() {
    const projectId = "554794d2-0ac3-4051-8be3-d56521cb151e";

    // Create Window ITP
    const windowType = await prisma.inspectionType.create({
        data: {
            projectId,
            name: "Window ITP (Residential)",
            sectionCode: "WIN-01",
            nodeTemplates: {
                create: windowsForm[0].nodes.map((node: any, idx: number) => ({
                    name: node.name,
                    description: node.description,
                    inputType: node.inputType,
                    options: node.options ? JSON.stringify(node.options) : null,
                    orderIndex: idx
                }))
            }
        }
    });

    console.log('Created Window Type:', windowType.id);

    // Create Generic Door Type (Simple version)
    const doorType = await prisma.inspectionType.create({
        data: {
            projectId,
            name: "Door Installation Checklist",
            sectionCode: "DOOR-01",
            nodeTemplates: {
                create: [
                    { name: "Room & Item Detail", description: "Location details", inputType: "form_group", orderIndex: 0, options: JSON.stringify([{ name: "Room", inputType: "text" }, { name: "Door ID", inputType: "text" }]) },
                    { name: "Frame Installation", description: "Check frame is square and plumb", inputType: "yes_no", orderIndex: 1 },
                    { name: "Door Leaf Fit", description: "Check gaps and operation", inputType: "yes_no", orderIndex: 2 }
                ]
            }
        }
    });

    console.log('Created Door Type:', doorType.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
