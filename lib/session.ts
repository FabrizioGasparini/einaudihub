import { getServerSession } from "next-auth";
import type { SessionUser } from "./types";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const u = session.user as any;

  return {
    id: u.id,
    email: u.email,
    name: u.name,
    classId: u.classId,
    roles: u.roles ?? [],
  };
}

