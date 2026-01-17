import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import UserManagementTable from "./UserManagementTable";
import { ScaleIn, FadeIn } from "@/components/MotionWrappers";
import { Users, ShieldCheck } from "lucide-react";

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
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
             {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-blue-200/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-200/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                <ScaleIn>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                                <Users size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestione Utenti</h1>
                                <p className="text-gray-500 font-medium">Controllo accessi e ruoli della piattaforma.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
                            <ShieldCheck size={16} />
                            <span>{users.length} Utenti Registrati</span>
                        </div>
                    </div>
                </ScaleIn>

                <FadeIn delay={0.2}>
                     <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden p-1">
                        <UserManagementTable users={users} />
                     </div>
                </FadeIn>
            </div>
        </div>
    );
}
