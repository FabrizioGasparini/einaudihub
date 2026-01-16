import type { RoleName } from "@prisma/client";

export type AppRole = Extract<
  RoleName,
  "STUDENT" | "CLASS_REP" | "SCHOOL_REP" | "MODERATOR" | "ADMIN"
>;

export type SessionRole = {
  role: AppRole;
  classId?: string | null;
  schoolWide: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  classId?: string | null;
  className?: string | null;
  roles: SessionRole[];
};

