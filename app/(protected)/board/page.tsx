import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import Link from "next/link"; // Was missing or used implicitly?
import { Pin, LayoutGrid, Sparkles, BarChart2 } from "lucide-react";
import PostCard from "./PostCard"; 
import PollCard from "@/app/(protected)/polls/PollCard";
import { FadeIn, ScaleIn, SlideIn, StaggerContainer } from "@/components/MotionWrappers";

type BoardPageProps = {
    searchParams: Promise<{ tab?: string; adminViewClassId?: string }>;
};

async function getActiveClassPolls(user: SessionUser, classId: string) {
    return await prisma.poll.findMany({
        where: {
            classId: classId,
            endsAt: { gte: new Date() } // Only active polls
        },
        include: {
            options: {
                include: {
                    _count: { select: { votes: true } }
                }
            },
            votes: {
                where: { userId: user.id },
                select: { optionId: true }
            },
            createdBy: {
                select: { 
                    name: true,
                    roles: { select: { role: true } } 
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

async function getPosts(user: SessionUser, tab: 'institute' | 'class', adminViewClassId?: string) {
    // Admin Override
    if (tab === 'class' && adminViewClassId) {
         // Verify admin permissions
         const isAdmin = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');
         if (isAdmin) {
             return await prisma.post.findMany({
                where: { classId: adminViewClassId, isHidden: false },
                include: {
                    author: { include: { roles: true } },
                    category: true,
                    _count: { select: { comments: true, likes: true } },
                    likes: { where: { userId: user.id }, select: { userId: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
         }
    }

    if (tab === 'class' && !user.classId) return [];

    const whereCondition: any = { isHidden: false };
    
    if (tab === 'institute') {
        whereCondition.classId = null; // Only global posts
    } else {
        whereCondition.classId = user.classId; // Only class posts
    }

    return await prisma.post.findMany({
        where: whereCondition,
        include: {
            author: { 
                include: { roles: true } 
            },
            category: true,
            _count: { select: { comments: true, likes: true } },
            likes: {
                where: { userId: user.id },
                select: { userId: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function BoardPage({ searchParams }: BoardPageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    const { tab, adminViewClassId } = await searchParams;
    const currentTab = (tab === 'class' && (user.classId || adminViewClassId)) ? 'class' : 'institute';
    
    // Check for admin view override
    const viewingClassId = adminViewClassId || user.classId;

    const posts = await getPosts(user, currentTab, adminViewClassId);
    const canPost = userHasPermission(user, "CREATE_STUDENT_POST");
    
    // Fetch categories for the "New Post" modal
    const categories = canPost ? await prisma.category.findMany() : [];

    // Display Title Logic
    let displayTitle = "Istituto";
    let titleDescription = "Voci e annunci da tutta la scuola.";
    if (currentTab === 'class') {
        if (adminViewClassId) {
            const classViewed = await prisma.class.findUnique({
                where: { id: adminViewClassId },
                select: { year: true, section: true }
            });

            displayTitle = `Spia Classe ${classViewed?.year || ""}${classViewed?.section || ""}`;
            titleDescription = "Visualizzazione amministrativa.";
        } else {
            displayTitle = `Classe ${user.className || ""}`;
            titleDescription = "Spazio riservato alla tua classe.";
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden pb-20">
             {/* Animated Background */}
             <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[5%] left-[40%] w-96 h-96 bg-green-300/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-emerald-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
                <div className="absolute top-[20%] left-[10%] w-80 h-80 bg-lime-200/20 rounded-full blur-[80px] animate-blob animation-delay-4000 mix-blend-multiply filter"></div>
            </div>

            {/* Header Sticky */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 shadow-sm px-4 md:px-8 py-4 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl text-white shadow-lg shadow-green-200">
                             <LayoutGrid size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                Bacheca
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-500 font-bold uppercase">{currentTab === 'institute' ? 'Pubblica' : 'Privata'}</span>
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">{displayTitle}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                         {/* Switcher Tabs */}
                         <div className="flex bg-gray-100/50 p-1.5 rounded-xl border border-gray-200/50 w-full md:w-auto">
                            <Link 
                                href="/board?tab=institute" 
                                className={`flex-1 md:flex-none text-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${currentTab === 'institute' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                                Istituto
                            </Link>
                            <Link 
                                href="/board?tab=class" 
                                className={`flex-1 md:flex-none text-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${currentTab === 'class' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                                Classe
                            </Link>
                        </div>
                         {canPost && (
                            <Link 
                                href={currentTab === 'class' ? "/board/new?type=POST&scope=CLASS" : "/board/new?type=POST"}
                                className="bg-gray-900 hover:bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg group"
                                title="Crea nuovo post"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <ScaleIn delay={0.1}>
                    <div className="mb-8 bg-gradient-to-r from-slate-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Pin size={180} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                        <Sparkles className="text-indigo-300" size={20} />
                                    </div>
                                    <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs">Spazio Studenti</span>
                                </div>
                                <h2 className="text-4xl font-black tracking-tight mb-2 text-white">{displayTitle}</h2>
                                <p className="text-indigo-200 text-lg max-w-2xl font-light">
                                    {titleDescription} Condividi idee, chiedi aiuto o pubblica annunci per i tuoi compagni.
                                </p>
                            </div>
                        </div>
                    </div>
                </ScaleIn>

                {posts.length === 0 ? (
                    <FadeIn delay={0.2}>
                         <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                            <div className="w-24 h-24 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center mb-6 transform -rotate-6">
                                <Pin size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Bacheca vuota</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                {currentTab === 'institute' 
                                    ? "Non ci sono ancora annunci ufficiali sulla bacheca dell'istituto." 
                                    : "Nessuno ha ancora appeso nulla nella bacheca di classe. Rompi il ghiaccio!"}
                            </p>
                        </div>
                    </FadeIn>
                ) : (
                    <StaggerContainer>
                         <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {posts.map((post, idx) => (
                                <div key={post.id} className="break-inside-avoid shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-white/40 backdrop-blur-sm">
                                    <PostCard 
                                        post={post as any} 
                                        currentUserId={user.id} 
                                        currentUserRoles={user.roles.map(r => r.role)}
                                        currentUserClassId={user.classId || undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </StaggerContainer>
                )}
            </div>
        </div>
    );
}

