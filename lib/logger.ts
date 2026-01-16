import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function logAction(
    action: string, 
    details: any | string, 
    userId?: string
) {
    try {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);

        await prisma.auditLog.create({
            data: {
                action,
                details: detailsStr,
                userId,
                ipAddress: ip,
                userAgent
            }
        });
    } catch (e) {
        console.error("Failed to log action:", e);
    }
}
