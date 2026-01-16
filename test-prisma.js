
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Prisma Client...");
    if (prisma.conversation) {
        console.log("prisma.conversation exists!");
        try {
             // Try a simple count
             // Note: conversation might be empty
             const count = await prisma.conversation.count();
             console.log("Count:", count);
        } catch (e) {
            console.error("Error query:", e.message);
        }
    } else {
        console.error("prisma.conversation is UNDEFINED.");
        console.log("Keys on prisma:", Object.keys(prisma));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
