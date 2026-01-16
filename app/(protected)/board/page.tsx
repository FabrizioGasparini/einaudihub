import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreatePostModal from "./CreatePostModal";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";

type BoardPageProps = {
    searchParams: Promise<{ tab?: string; adminViewClassId?: string }>;
};

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
    // ... rest of function

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
    if (currentTab === 'class') {
        if (adminViewClassId) displayTitle = `Spia Classe ${adminViewClassId}`;
        else displayTitle = `Classe ${user.className || user.classId || ""}`;
    }

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Header Sticky */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b shadow-sm px-6 py-4 mb-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">EinaudiHub <span className="text-gray-400 font-light">| Bacheca</span></h1>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{displayTitle}</p>
                    </div>
                    
                    <div className="flex gap-4">
                         {/* Switcher Tabs */}
                        <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
                            <Link 
                                href="/board?tab=institute" 
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentTab === 'institute' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Istituto
                            </Link>
                            <Link 
                                href="/board?tab=class" 
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentTab === 'class' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Classe
                            </Link>
                        </div>

                         {canPost && (
                            <CreatePostModal 
                                categories={categories}
                                user={{ classId: user.classId }}
                            />
                        )}
                    </div>
                </div>
                
                {/* Mobile Tabs */}
                <div className="md:hidden flex mt-4 border-t pt-2">
                    <Link 
                        href="/board?tab=institute" 
                        className={`flex-1 text-center py-2 text-sm font-bold ${currentTab === 'institute' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                    >
                        Istituto
                    </Link>
                    <Link 
                        href="/board?tab=class" 
                        className={`flex-1 text-center py-2 text-sm font-bold ${currentTab === 'class' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                    >
                        Classe
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Pin size={32} className="text-gray-300 transform -rotate-12" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Bacheca vuota</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            {currentTab === 'institute' 
                                ? "Non ci sono ancora annunci ufficiali sulla bacheca dell'istituto." 
                                : "Nessuno ha ancora appeso nulla nella bacheca di classe."}
                        </p>
                    </div>
                ) : (
                    // Masonry Grid Layout for "Physical Board" feel
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {posts.map(post => (
                            <div key={post.id} className="break-inside-avoid">
                                <PostCard 
                                    post={post as any} 
                                    currentUserId={user.id} 
                                    currentUserRoles={user.roles.map(r => r.role)}
                                    currentUserClassId={user.classId || undefined}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

