import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CommentForm } from "./comment-form";
import BoardActions from "./BoardActions";
import Link from "next/link";
import { ArrowLeft, Clock, User as UserIcon, MessageCircle } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { userHasPermission } from "@/lib/authz";
import { FadeIn, ScaleIn, StaggerContainer } from "@/components/MotionWrappers";

type PostDetailPageProps = {
  params: Promise<{ postId: string }>;
};

async function getPost(postId: string) {
    return await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: true,
            category: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'asc' },
                where: { isHidden: false } // Basic moderation filter
            }
        }
    });
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  const { postId } = await params;
  const post = await getPost(postId);

  if (!post) {
      notFound();
  }

  // Check visibility access (Class Scope)
  if (post.classId && post.classId !== user.classId && !userHasPermission(user, "MODERATE_PLATFORM")) {
      return (
          <div className="text-center py-20">
              <h1 className="text-red-600 font-bold text-2xl">Accesso Negato</h1>
              <p>Questo post è visibile solo alla classe {post.classId}.</p>
              <Link href="/board" className="text-blue-600 underline mt-4 block">Torna alla bacheca</Link>
          </div>
      );
  }

  const canComment = userHasPermission(user, "COMMENT");
  
  const isOwner = post.authorId === user.id;
  const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');
  // Permissions for Class Reps in their own class context
  const isClassRep = user.roles.some(r => r.role === 'CLASS_REP');
  const isClassPost = post.classId === user.classId && !!post.classId;
  const canDelete = isOwner || hasAdminPower || (isClassRep && isClassPost);
  
  return (
    <div className="relative min-h-screen pb-20 bg-stone-50">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 right-[-100px] w-[600px] h-[600px] bg-gradient-to-b from-green-100 to-transparent opacity-50 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-6 px-4">
        <div className="mb-6">
             <Link href="/board" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow border">
                <ArrowLeft size={16} className="mr-1" /> Torna alla bacheca
            </Link>
        </div>

        <ScaleIn>
            <article className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 ring-1 ring-black/5">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                             <div className="flex items-center gap-2 mb-3">
                                {post.category && (
                                    <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-blue-100">
                                        {post.category.name}
                                    </span>
                                )}
                                {post.classId && (
                                    <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-amber-100">
                                        Solo Classe
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
                        </div>
                        <div className="flex-shrink-0">
                            <BoardActions 
                                postId={post.id} 
                                isOwner={isOwner} 
                                hasAdminPower={hasAdminPower}
                                canDelete={canDelete} 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                {post.author.name[0]}
                            </div>
                            <span className="font-medium text-gray-900">{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <Clock size={16} />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </div>
                </div>
            </article>
        </ScaleIn>
        
        <div className="max-w-3xl mx-auto">
             <div className="flex items-center gap-2 mb-6 ml-2">
                 <MessageCircle className="text-gray-400" />
                 <h3 className="text-xl font-bold text-gray-800">
                    Discussione <span className="text-gray-400 font-normal ml-1">{post.comments.length}</span>
                 </h3>
             </div>

             <div className="space-y-6 mb-8 relative">
                 {/* Thread line */}
                 {post.comments.length > 0 && (
                     <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200 z-0 hidden md:block" />
                 )}

                 <StaggerContainer className="space-y-6">
                     {post.comments.length === 0 ? (
                         <FadeIn>
                            <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed text-gray-400 italic">
                                Sii il primo a commentare!
                            </div>
                         </FadeIn>
                     ) : (
                         post.comments.map(comment => {
                             const isMe = comment.authorId === user.id;
                             return (
                                <div key={comment.id} className={`relative z-10 flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                     {/* Avatar */}
                                     <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white
                                         ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}>
                                         {comment.author.name[0]}
                                     </div>
                                     
                                     {/* Bubble */}
                                     <div className={`flex-1 max-w-[85%] ${isMe ? 'text-right' : ''}`}>
                                         <div className="flex items-baseline gap-2 mb-1 px-1 justify-end" style={{ flexDirection: isMe ? 'row' : 'row-reverse' }}>
                                             <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                             <span className="font-bold text-sm text-gray-900">{comment.author.name}</span>
                                         </div>
                                         <div className={`inline-block p-4 rounded-2xl shadow-sm text-sm leading-relaxed text-left
                                             ${isMe 
                                                 ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                 : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                             }`}>
                                             {comment.content}
                                         </div>
                                     </div>
                                 </div>
                             );
                         })
                     )}
                 </StaggerContainer>
             </div>

             {canComment && (
                 <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 sticky bottom-4 z-20">
                    <CommentForm postId={post.id} />
                 </div>
             )}
         </div>
      </div>
    </div>
  );
}

