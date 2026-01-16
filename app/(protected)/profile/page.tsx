import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";
import { User, Mail, School, Shield } from "lucide-react";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    // Refresh user data from DB to get latest info
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            roles: true,
            class: true,
            _count: {
                select: {
                    posts: true,
                    comments: true,
                }
            }
        }
    });

    if (!dbUser) redirect("/login");

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Il mio Profilo</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <User size={40} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="pt-14 px-8 pb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{dbUser.name}</h2>
                    <p className="text-gray-500">{dbUser.email}</p>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                        {dbUser.roles.map(r => (
                            <span key={r.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                                {r.role}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                                <p className="font-medium text-gray-900">{dbUser.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-400">
                                <School size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Classe</p>
                                <p className="font-medium text-gray-900">
                                    {dbUser.class ? `${dbUser.class.year}${dbUser.class.section}` : "Nessuna classe assegnata"}
                                </p>
                            </div>
                        </div>

                         <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-gray-400">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Statistiche</p>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-sm"><b>{dbUser._count.posts}</b> Post pubblicati</span>
                                    <span className="text-sm"><b>{dbUser._count.comments}</b> Commenti</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
