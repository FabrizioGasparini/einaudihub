import type { SessionUser } from "./types";
import type { AppRole } from "./types";
import { getPermissionsForRoles, type Permission } from "./rbac";

export function getUserRoles(user: SessionUser): AppRole[] {
  return user.roles.map((r) => r.role);
}

/**
 * Verifica se l'utente ha una determinata permission in senso globale.
 */
export function userHasPermission(
  user: SessionUser | null,
  permission: Permission
): boolean {
  if (!user || !user.roles) return false;
  const roleNames = user.roles.map((r) => r.role);
  const perms = getPermissionsForRoles(roleNames);
  return perms.has(permission);
}

/**
 * Verifica se l'utente ha diritti amministrativi/moderazione su una specifica classe.
 */
export function canModerateClass(
  user: SessionUser | null,
  classId: string
): boolean {
  if (!user || !user.roles) return false;

  return user.roles.some((r) => {
    if (r.role === "ADMIN" || r.role === "MODERATOR") return true;
    if (r.role === "CLASS_REP" && r.classId === classId) return true;
    return false;
  });
}

export function isSchoolOfficial(user: SessionUser | null): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some(r => ["ADMIN", "MODERATOR", "SCHOOL_REP"].includes(r.role));
}

export function isAdmin(user: SessionUser | null): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some(r => r.role === "ADMIN");
}

