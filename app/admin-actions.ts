'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { RoleName } from "@prisma/client"; 
import { revalidatePath } from "next/cache";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import { logAction } from "@/lib/logger";

// Safety check helper
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user as SessionUser;
    
    // Hard check: Only admins can manage users
    if (!userHasPermission(user, "MANAGE_USERS")) {
        throw new Error("Forbidden: Insufficient permissions");
    }
    return user;
}

export async function toggleUserRole(targetUserId: string, roleToToggle: RoleName) {
    try {
        const adminUser = await checkAdmin();
        
        // Cannot toggle STUDENT role, it's the base state (absence of other roles)
        if (roleToToggle === 'STUDENT') {
            return { success: false, error: "Cannot toggle base STUDENT role" };
        }

        const userToUpdate = await prisma.user.findUnique({ 
            where: { id: targetUserId },
            include: { roles: true }
        });
        
        if (!userToUpdate) return { success: false, error: "User not found" };

        const existingRoleIndex = userToUpdate.roles.findIndex(r => r.role === roleToToggle);
        const hasRole = existingRoleIndex !== -1;

        if (hasRole) {
            // Remove the role
            await prisma.userRole.delete({
                where: { id: userToUpdate.roles[existingRoleIndex].id }
            });
            await logAction("REMOVE_USER_ROLE", { targetUserId, role: roleToToggle }, adminUser.id);
        } else {
            // Add the role
            const isSchoolWide = ['ADMIN', 'MODERATOR', 'SCHOOL_REP'].includes(roleToToggle);
            const roleClassId = isSchoolWide ? null : userToUpdate.classId;

            // Validation: Cannot be CLASS_REP without a class
            if (roleToToggle === 'CLASS_REP' && !roleClassId) {
                return { success: false, error: "User has no class assigned, cannot be Class Rep" };
            }

            await prisma.userRole.create({
                data: {
                    userId: targetUserId,
                    role: roleToToggle,
                    schoolWide: isSchoolWide,
                    classId: roleClassId
                }
            });
            await logAction("ADD_USER_ROLE", { targetUserId, role: roleToToggle }, adminUser.id);
        }

        revalidatePath('/admin/users');
        revalidatePath('/board'); 
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle user role:", error);
        return { success: false, error: "Failed to toggle role" };
    }
}

export async function createClass(year: number, section: string) {
    try {
        const adminUser = await checkAdmin();
        
        const existingClass = await prisma.class.findFirst({
            where: { year, section }
        });

        if (existingClass) return { success: false, error: "Class already exists" };

        await prisma.class.create({
            data: { year, section }
        });

        await logAction("CREATE_CLASS", { year, section }, adminUser.id);

        revalidatePath('/admin/classes');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to create class" };
    }
}

export async function deleteClass(classId: string) {
    try {
        const adminUser = await checkAdmin();
        
        await prisma.class.delete({
            where: { id: classId }
        });
        
        await logAction("DELETE_CLASS", { classId }, adminUser.id);

        revalidatePath('/admin/classes');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: "Failed" };
    }
}

export async function deleteUser(targetUserId: string) {
    try {
        const adminUser = await checkAdmin();

        if (adminUser.id === targetUserId) {
            throw new Error("Cannot delete yourself");
        }

        await prisma.user.delete({
            where: { id: targetUserId }
        });
        
        await logAction("DELETE_USER", { targetUserId }, adminUser.id);

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
