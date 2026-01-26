
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // We'll check all projects and their types
    const projects = await prisma.project.findMany({
        include: {
            inspectionTypes: true
        }
    });

    console.log('--- PROJECTS & TYPES ---');
    projects.forEach(p => {
        console.log(`Project: ${p.id} (${p.name})`);
        console.log(`Type Count: ${p.inspectionTypes.length}`);
        p.inspectionTypes.forEach(t => console.log(` - ${t.name} (${t.id})`));
        console.log('---');
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
