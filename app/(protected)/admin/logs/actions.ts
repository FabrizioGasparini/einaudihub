"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { SessionUser } from "@/lib/types";

export interface LogFilter {
    search?: string;
    action?: string;
    page?: number;
}

export async function getAuditLogs(filter: LogFilter = {}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user || !user.roles.some(r => r.role === "ADMIN")) {
        throw new Error("Unauthorized");
    }

    const page = filter.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.search) {
        where.OR = [
            { user: { name: { contains: filter.search } } },
            { user: { email: { contains: filter.search } } },
            { details: { contains: filter.search } },
            { action: { contains: filter.search } }
        ];
    }

    if (filter.action && filter.action !== "ALL") {
        where.action = filter.action;
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip
        }),
        prisma.auditLog.count({ where })
    ]);

    return {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalLogs: total
    };
}

export async function getLogActions() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user || !user.roles.some(r => r.role === "ADMIN")) {
        return [];
    }

    // Get unique actions
    const actions = await prisma.auditLog.groupBy({
        by: ['action'],
    });

    return actions.map(a => a.action);
}
