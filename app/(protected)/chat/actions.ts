"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/types";
import { logAction } from "@/lib/logger";

export async function getConversations() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const user = session.user as SessionUser;

    return await prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId: user.id }
            },
            messages: { some: {} } // Only with at least one message
        },
        include: {
            participants: {
                include: { user: true }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function searchUsersToChat(query: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const user = session.user as SessionUser;

    if (!query || query.length < 2) return [];

    return await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } }
            ],
            // Exclude self and ensure it's a student (or rep, which implies student usually)
            AND: [
                { NOT: { id: user.id } },
                { roles: { some: { role: 'STUDENT' } } }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            roles: { select: { role: true } },
            class: { select: { year: true, section: true } }
        },
        take: 5
    });
}

export async function startNewChat(targetUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user as SessionUser;

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { userId: user.id } } },
                { participants: { some: { userId: targetUserId } } }
            ],
            // Ensure strictly 2 participants for direct chat (if we had group chats this would be more complex)
            // For now assuming 1-on-1 chats are unique pairs
        },
        include: {
            participants: true
        }
    });

    if (existing) {
        // If > 2 participants, it might be a group chat, but let's assume direct chat reuse
        return { conversationId: existing.id };
    }

    // Create new
    const conversation = await prisma.conversation.create({
        data: {
            participants: {
                create: [
                    { userId: user.id },
                    { userId: targetUserId }
                ]
            }
        }
    });

    await logAction("START_CHAT", { conversationId: conversation.id, targetUserId }, user.id);
    revalidatePath("/chat");
    return { conversationId: conversation.id };
}

export async function getReps() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const user = session.user as SessionUser;

    const whereConditions: any[] = [
        { roles: { some: { role: 'SCHOOL_REP' } } }
    ];

    if (user.classId) {
        whereConditions.push({
            AND: [
                { classId: user.classId },
                { roles: { some: { role: 'CLASS_REP' } } }
            ]
        });
    }

    return await prisma.user.findMany({
        where: {
            OR: whereConditions,
            NOT: { id: user.id }
        },
        select: {
            id: true,
            name: true,
            avatarUrl: true,
            roles: { select: { role: true } },
            class: { select: { year: true, section: true } }
        },
        orderBy: { name: 'asc' }
    });
}



export async function getConversation(conversationId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const user = session.user as SessionUser;

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                include: {
                    user: {
                        include: {
                            roles: true,
                            class: true
                        }
                    }
                }
            },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: { sender: true }
            }
        }
    });

    if (!conversation) return null;

    // Security check: Must be participant
    const isParticipant = conversation.participants.some(p => p.userId === user.id);
    if (!isParticipant) return null;

    return conversation;
}

export async function sendMessage(conversationId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user as SessionUser;

    if (!content.trim()) return { error: "Empty message" };

    try {
        const msg = await prisma.message.create({
            data: {
                content,
                conversationId,
                senderId: user.id
            }
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        // Set unread for others
        await prisma.conversationParticipant.updateMany({
            where: { 
                conversationId, 
                userId: { not: user.id } 
            },
            data: { hasUnread: true }
        });
        
        await logAction("SEND_MESSAGE", { conversationId, messageId: msg.id }, user.id);

        revalidatePath(`/chat/${conversationId}`);
        revalidatePath(`/chat`);
        return { success: true };
    } catch (e) {
        return { error: "Failed to send" };
    }
}

export async function markConversationAsRead(conversationId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return;
    const user = session.user as SessionUser;

    try {
        await prisma.conversationParticipant.updateMany({
             where: {
                 conversationId,
                 userId: user.id
             },
             data: { hasUnread: false }
        });
        await logAction("READ_CONVERSATION", { conversationId }, user.id);
        revalidatePath("/chat");
    } catch (e) {
        // ignore
    }
}


export async function deleteMessage(messageId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user as SessionUser;

    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return { error: "Not found" };
    if (msg.senderId !== user.id) return { error: "Not your message" };

    await prisma.message.delete({ where: { id: messageId } });
    await logAction("DELETE_MESSAGE", { messageId, conversationId: msg.conversationId }, user.id);
    
    revalidatePath(`/chat/${msg.conversationId}`);
    return { success: true };
}

export async function editMessage(messageId: string, newContent: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user as SessionUser;

    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return { error: "Not found" };
    if (msg.senderId !== user.id) return { error: "Not your message" };

    await prisma.message.update({ 
        where: { id: messageId },
        data: { content: newContent }
    });
    
    await logAction("EDIT_MESSAGE", { messageId, conversationId: msg.conversationId }, user.id);

    revalidatePath(`/chat/${msg.conversationId}`);
    return { success: true };
}

export async function startConversation(targetUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user as SessionUser;

    if (targetUserId === user.id) return { error: "Cannot chat with yourself" };

    try {
        // Check if conversation already exists
        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: user.id } } },
                    { participants: { some: { userId: targetUserId } } }
                ]
            }
        });

        if (existing) return { conversationId: existing.id };

        // Create new
        const newConv = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: user.id },
                        { userId: targetUserId }
                    ]
                }
            }
        });

        await logAction("START_CONVERSATION", { conversationId: newConv.id, targetUserId }, user.id);

        return { conversationId: newConv.id };
    } catch (e) {
        return { error: "Failed to start conversation" };
    }
}

export async function getSchoolReps() {
    return await prisma.user.findMany({
        where: {
            roles: {
                some: { role: 'SCHOOL_REP' }
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
        }
    });
}

export async function deleteConversation(conversationId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user as SessionUser;

    try {
        await prisma.conversationParticipant.deleteMany({
            where: {
                conversationId: conversationId,
                userId: user.id
            }
        });
        revalidatePath("/chat");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete" };
    }
}
