import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CommentForm } from "./comment-form";
import BoardActions from "./BoardActions";
import Link from "next/link";
import { ArrowLeft, Clock, User as UserIcon } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { userHasPermission } from "@/lib/authz";

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
  
  // Pass permissions to client component
  return (
    <div className="max-w-3xl mx-auto py-6">
      <Link href="/board" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
         <ArrowLeft size={16} className="mr-1" /> Torna alla bacheca
      </Link>

      <article className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
         <div className="p-6">
             <div className="flex justify-between items-start mb-4">
                 <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                 <div className="flex items-center gap-2">
                     {post.category && (
                         <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                             {post.category.name}
                         </span>
                     )}
                     <BoardActions 
                        postId={post.id} 
                        isOwner={isOwner} 
                        hasAdminPower={hasAdminPower}
                        canDelete={canDelete} 
                     />
                 </div>
             </div>

             <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-4">
                 <div className="flex items-center gap-1">
                     <UserIcon size={16} />
                     <span>{post.author.name}</span>
                 </div>
                 <div className="flex items-center gap-1">
                     <Clock size={16} />
                     <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                 </div>
                 {post.classId && (
                     <span className="text-amber-600 font-medium">Solo Classe</span>
                 )}
             </div>

             <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                 {post.content}
             </div>
         </div>
         
         <div className="bg-gray-50 p-6 border-t">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 Commenti <span className="text-gray-500 font-normal">({post.comments.length})</span>
             </h3>

             <div className="space-y-4">
                 {post.comments.length === 0 ? (
                     <p className="text-gray-500 text-sm italic">Nessun commento finora.</p>
                 ) : (
                     post.comments.map(comment => (
                         <div key={comment.id} className="flex gap-3">
                             <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600 font-bold">
                                 {comment.author.name[0]}
                             </div>
                             <div className="flex-1 bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm text-sm border">
                                 <div className="flex justify-between items-baseline mb-1">
                                     <span className="font-bold text-gray-900">{comment.author.name}</span>
                                     <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                                 <p className="text-gray-700">{comment.content}</p>
                             </div>
                         </div>
                     ))
                 )}
             </div>

             {canComment && <CommentForm postId={post.id} />}
         </div>
      </article>
    </div>
  );
}

