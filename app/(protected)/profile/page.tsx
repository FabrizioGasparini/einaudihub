import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";
import { User, Mail, School, Shield, Activity, Calendar } from "lucide-react";
import { FadeIn, ScaleIn, StaggerContainer } from "@/components/MotionWrappers";
import PostCard from "@/app/(protected)/board/PostCard";
import UserRoleBadge from "@/components/UserRoleBadge";

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
            },
            posts: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                     author: { include: { roles: true } },
                     category: true,
                     likes: { where: { userId: user.id }, select: { userId: true } },
                     _count: { select: { comments: true, likes: true } }
                }
            }
        }
    });

    if (!dbUser) redirect("/login");

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
             {/* Animated Background */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] right-[30%] w-96 h-96 bg-indigo-300/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
                <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-blue-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
             </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <ScaleIn>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-900 shadow-2xl p-8 mb-8 text-white">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <User size={180} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                        <Activity className="text-indigo-300" size={20} />
                                    </div>
                                    <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs">Il Mio Profilo</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tight mb-2 text-white">
                                    {dbUser.name}
                                </h1>
                                <p className="text-indigo-200 text-lg max-w-xl font-light">
                                    {dbUser.email}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {dbUser.roles.map(r => (
                                        <UserRoleBadge key={r.role} role={r.role} />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center min-w-[150px]">
                                <span className="block text-3xl font-black text-white">{dbUser._count.posts}</span>
                                <span className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Post Pubblicati</span>
                            </div>
                        </div>
                    </div>
                </ScaleIn>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                         <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Shield className="text-indigo-600" size={20} />
                                Dettagli Account
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Mail className="text-gray-400" size={18} />
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{dbUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <School className="text-gray-400" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Classe</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {dbUser.class ? `${dbUser.class.year}${dbUser.class.section}` : "Nessuna"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Calendar className="text-gray-400" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Attività</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {dbUser._count.comments} Commenti
                                        </p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-2">
                             Attività Recente
                        </h3>
                        {dbUser.posts.length > 0 ? (
                            <StaggerContainer className="flex flex-col gap-4">
                                {dbUser.posts.map(post => (
                                    <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        currentUserId={user.id} 
                                    />
                                ))}
                            </StaggerContainer>
                        ) : (
                            <FadeIn>
                                <div className="text-center py-10 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">Non hai ancora pubblicato nulla.</p>
                                </div>
                            </FadeIn>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
