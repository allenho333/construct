
import { prisma } from "./src/lib/prisma";

async function main() {
    const instance = await prisma.inspectionInstance.findFirst({
        include: { project: true }
    });

    if (instance) {
        console.log(`URL: http://localhost:3000/project/${instance.projectId}/${instance.id}`);
    } else {
        console.log("No instances found.");
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
