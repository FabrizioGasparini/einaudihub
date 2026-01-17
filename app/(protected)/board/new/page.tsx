import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import { CreatePostForm } from "./create-post-form";
import { ScaleIn } from "@/components/MotionWrappers";
import { PenTool, Sparkles, LayoutGrid } from "lucide-react";

type PageProps = {
    searchParams: Promise<{ scope?: string; type?: string }>;
}

export default async function NewPostPage(props: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;
  
  // Permissions Check
  const permissions = {
    canCreatePost: userHasPermission(user, "CREATE_STUDENT_POST"),
    canCreateAnnouncement: userHasPermission(user, "CREATE_SCHOOL_ANNOUNCEMENT") || userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT"),
    canCreateEvent: userHasPermission(user, "CREATE_SCHOOL_EVENT") || userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT"),
    canCreatePoll: userHasPermission(user, "CREATE_GLOBAL_POLL") || userHasPermission(user, "CREATE_CLASS_POLL"),
  };

  const hasAnyPermission = Object.values(permissions).some(Boolean);

  if (!hasAnyPermission) {
    return (
        <div className="text-center py-10">
            <h1 className="text-red-600 font-bold">Non autorizzato</h1>
            <p>Non hai il permesso di creare contenuti.</p>
        </div>
    );
  }

  const { scope, type } = await props.searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  
  // If admin, fetch classes for selector
  const isAdmin = user.roles.some(r => r.role === 'ADMIN');
  let allClasses = null;
  if(isAdmin) {
      allClasses = await prisma.class.findMany({ 
          select: { id: true, year: true, section: true },
          orderBy: { year: 'asc' }
      });
  }

  // Validate type
  let validType: 'POST' | 'ANNOUNCEMENT' | 'EVENT' | 'POLL' | undefined = undefined;
  if (type === 'POST' || type === 'ANNOUNCEMENT' || type === 'EVENT' || type === 'POLL') {
      validType = type;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
         {/* Animated Background */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[5%] right-[20%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
            <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-blue-100/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
            <ScaleIn>
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 shadow-2xl p-8 mb-8 text-white ring-1 ring-white/10">
                    <div className="absolute -top-10 -right-10 p-8 opacity-10 rotate-12">
                        <PenTool size={180} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                                <Sparkles className="text-indigo-200" size={20} />
                            </div>
                            <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs font-bold">Content Creator</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-3 text-white">
                            Nuovo Contenuto
                        </h1>
                        <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-lg opacity-90">
                            Crea Post, Avvisi, Eventi o Sondaggi in un unico posto.
                        </p>
                    </div>
                </div>
            </ScaleIn>
            
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/60">
                <CreatePostForm 
                    categories={categories} 
                    user={user} 
                    defaultScope={(scope === 'CLASS' && user.classId) ? 'CLASS' : 'GLOBAL'}
                    defaultType={validType}
                    permissions={permissions}
                    isAdmin={isAdmin}
                    allClasses={allClasses || []}
                />
            </div>
        </div>
    </div>
  );
}

