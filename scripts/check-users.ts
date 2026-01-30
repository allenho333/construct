
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- USERS ---');
    users.forEach(u => {
        console.log(`ID: ${u.id}`);
        console.log(`Phone: '${u.phoneNumber}'`); // quoted to see spaces
        console.log(`Email: '${u.email}'`);
        console.log('--------');
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
