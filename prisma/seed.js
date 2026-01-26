const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 0. Clean and Seed Default User
    console.log('Cleaning User table...');
    // await prisma.user.deleteMany({}); // Cleaning is done by migrate reset usually, or we can keep it. 

    // Commenting out default user for manual registration testing
    /*
    const hashedPassword = await bcrypt.hash("0000", 10);
    const defaultUser = await prisma.user.create({
        data: {
            phoneNumber: "02885219440",
            password: hashedPassword,
            email: "admin@constructoo.com" // Optional default
        }
    });
    console.log(`Default user seeded: ${defaultUser.phoneNumber}`);
    */


    // 1. Create Default Project
    // 1. Create Default Project
    // Clean projects first to ensure fresh seed with new ID
    await prisma.project.deleteMany({});

    const project = await prisma.project.create({
        data: {
            // id: auto-generated UUID
            name: '012- Norrebro Waston Block C',
            location: '46 Aspinall St, Watson ACT 2602',
            assignees: 'Jeff Pitz',
            responsible: 'Charles Chen'
        }
    });
    console.log(`Project seeded: ${project.name} (${project.id})`);

    // 2. Sync Forms from JSON Directory
    const formsDir = path.join(__dirname, '../src/config/forms');

    // Ensure directory exists or fallout to old path if needed (but we prefer strictness here)
    if (!fs.existsSync(formsDir)) {
        console.error(`Forms directory not found: ${formsDir}`);
        return;
    }

    const formFiles = fs.readdirSync(formsDir).filter(file => file.endsWith('.json'));

    // Clear existing types to avoid duplicates during dev
    await prisma.inspectionNodeResult.deleteMany({});
    await prisma.inspectionInstance.deleteMany({});
    await prisma.inspectionNodeTemplate.deleteMany({});
    await prisma.inspectionType.deleteMany({});

    for (const file of formFiles) {
        const filePath = path.join(formsDir, file);
        const formsConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`Loading forms from: ${file}`);

        for (const form of formsConfig) {
            // Find or create InspectionType
            const inspectionType = await prisma.inspectionType.create({
                data: {
                    projectId: project.id,
                    name: form.name,
                    sectionCode: form.sectionCode,
                    nodeTemplates: {
                        create: form.nodes.map((node, index) => ({
                            name: node.name,
                            description: node.description,
                            inputType: node.inputType || "text",
                            options: node.options ? JSON.stringify(node.options) : null,
                            orderIndex: node.orderIndex || index
                        }))
                    }
                }
            });

            console.log(`Created Inspection Type: ${inspectionType.name} with ${form.nodes.length} nodes`);
        }
    }

    // 3. Create a dummy instance for testing
    // Get the first inspection type
    const firstType = await prisma.inspectionType.findFirst({
        where: { sectionCode: "WIN-01" } // Target the window inspection
    });

    if (firstType) {
        await prisma.inspectionInstance.create({
            data: {
                projectId: project.id,
                inspectionTypeId: firstType.id,
                itpNumber: null,
                locationReference: 'Block West, Unit 37',
                itemReference: 'U-W37_W-05',
                status: 'Open'
            }
        });
        console.log('Created dummy Inspection Instance');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
