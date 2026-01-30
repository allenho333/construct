
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const phoneNumber = "02885219447";
    const email = "allen.guanghong.he@gmail.com";
    const password = "password"; // temporary
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { phoneNumber },
        update: { email },
        create: {
            phoneNumber,
            email,
            password: hashedPassword
        }
    });

    console.log('User created:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
