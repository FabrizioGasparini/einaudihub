
import { prisma } from './lib/prisma';

async function main() {
    console.log("Checking Prisma Client...");
    // @ts-ignore
    if (prisma.conversation) {
        console.log("prisma.conversation exists!");
        try {
             // @ts-ignore
             const count = await prisma.conversation.count();
             console.log("Count:", count);
        } catch (e: any) {
            console.error("Error query:", e.message);
        }
    } else {
        console.error("prisma.conversation is UNDEFINED.");
        console.log("Keys on prisma:", Object.keys(prisma));
        // Check prototype
        console.log("Keys on proto:", Object.getOwnPropertyNames(Object.getPrototypeOf(prisma)));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
