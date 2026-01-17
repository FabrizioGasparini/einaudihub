"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SessionUser } from "@/lib/types";

import { logAction } from "@/lib/logger";

export async function togglePostLike(postId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const user = session.user as SessionUser;
    const userId = user.id;

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
        where: {
            postId_userId: { postId, userId }
        }
    });

    try {
        if (existingLike) {
            await prisma.postLike.delete({
                where: {
                    postId_userId: { postId, userId }
                }
            });
            await logAction("UNLIKE_POST", { postId }, userId);
        } else {
            await prisma.postLike.create({
                data: {
                    postId,
                    userId
                }
            });
            await logAction("LIKE_POST", { postId }, userId);
        }
        revalidatePath("/board");
        return { success: true };
    } catch (e) {
        return { error: "Failed to toggle like" };
    }
}

export async function deletePost(postId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    
    const user = session.user as SessionUser;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { error: "Not found" };

    // Check ownership or admin/mod
    // Simplification: only author can delete for now, or admin check
    const isAuthor = post.authorId === user.id;
    
    // Check Permissions
    const isAdmin = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');
    const isClassRep = user.roles.some(r => r.role === 'CLASS_REP') && user.classId === post.classId;

    if (!isAuthor && !isAdmin && !isClassRep) {
         return { error: "Forbidden" };
    }

    try {
        await prisma.post.delete({ where: { id: postId } });
        await logAction("DELETE_POST", { postId, authorId: post.authorId }, user.id);
        revalidatePath("/board");
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete" };
    }
}

export async function reportPost(postId: string, reason?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Devi effettuare il login" };
    const user = session.user as SessionUser;

    try {
        // Check if already reported to prevent spam (optional)
        const existingReport = await prisma.report.findFirst({
            where: {
                postId,
                reporterId: user.id,
                handled: false
            }
        });

        if (existingReport) {
            return { error: "Hai già segnalato questo post." };
        }

        const report = await prisma.report.create({
            data: {
                reporterId: user.id,
                postId: postId,
                reason: reason || "Contenuto inappropriato (Segnalazione rapida)",
                handled: false
            }
        });

        await logAction("REPORT_POST", { postId, reportId: report.id }, user.id);
        
        return { success: true };
    } catch (e) {
        console.error("Report error:", e);
        return { error: "Errore durante l'invio della segnalazione." };
    }
}
