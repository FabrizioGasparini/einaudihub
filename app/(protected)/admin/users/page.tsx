import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import UserManagementTable from "./UserManagementTable";

export default async function UsersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    if (!isAdmin(user)) {
        redirect("/home");
    }

    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        include: {
            roles: true,
            class: {
                select: {
                    year: true,
                    section: true
                }
            }
        }
    });

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-6">
            <header className="px-4 md:px-0">
                <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
                <p className="text-gray-600">
                    Visualizza e modifica i ruoli degli utenti registrati.
                </p>
            </header>

            <div className="px-4 md:px-0">
                <UserManagementTable users={users} />
            </div>
        </div>
    );
}
