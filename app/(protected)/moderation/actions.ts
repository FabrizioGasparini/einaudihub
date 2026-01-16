"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SessionUser } from "@/lib/types";
import { userHasPermission } from "@/lib/authz";

import { logAction } from "@/lib/logger";

export async function dismissReport(reportId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Login richiesto" };
    const user = session.user as SessionUser;

    if (!userHasPermission(user, "MODERATE_PLATFORM")) {
        return { error: "Non autorizzato" };
    }

    try {
        await prisma.report.update({
            where: { id: reportId },
            data: { 
                handled: true, 
                handledById: user.id 
            }
        });
        await logAction("DISMISS_REPORT", { reportId }, user.id);
        revalidatePath("/moderation");
        return { success: true };
    } catch (e) {
        return { error: "Errore" };
    }
}

export async function hideContent(reportId: string, type: 'post' | 'comment', contentId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Login richiesto" };
    const user = session.user as SessionUser;

    if (!userHasPermission(user, "MODERATE_PLATFORM")) {
        return { error: "Non autorizzato" };
    }

    try {
        await prisma.$transaction(async (tx) => {
             // 1. Mark report as handled
            await tx.report.update({
                where: { id: reportId },
                data: {
                    handled: true,
                    handledById: user.id
                }
            });

            // 2. Hide content
            if (type === 'post') {
                await tx.post.update({
                    where: { id: contentId },
                    data: {
                        isHidden: true,
                        hiddenById: user.id
                    }
                });
            } else if (type === 'comment') {
                await tx.comment.update({
                    where: { id: contentId },
                    data: {
                        isHidden: true,
                        hiddenById: user.id
                    }
                });
            }
        });
       
        await logAction("HIDE_CONTENT", { reportId, type, contentId }, user.id);
        
        revalidatePath("/moderation");
        revalidatePath("/board"); 
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Errore durante l'operazione" };
    }
}
