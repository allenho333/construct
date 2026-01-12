const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const templates = await prisma.inspectionNodeTemplate.findMany({
        include: { inspectionType: true }
    });
    console.log("Found templates:", templates.length);
    templates.forEach(t => {
        console.log(`[${t.inspectionType.name}] Node: ${t.name}, InputType: ${t.inputType}, Options: ${t.options}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
