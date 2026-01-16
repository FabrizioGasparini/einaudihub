import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditPostForm from "./EditPostForm";
import type { SessionUser } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ postId: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;
    
    const { postId } = await params;

    const post = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!post) notFound();

    // Permission Check
    const isOwner = post.authorId === user.id;
    const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

    if (!isOwner && !hasAdminPower) {
        redirect("/board");
    }

    const categories = await prisma.category.findMany();

    return (
        <div className="max-w-2xl mx-auto pb-20 pt-8 px-4">
             <div className="mb-8">
                <Link href={`/board/${postId}`} className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4">
                    <ArrowLeft size={20} className="mr-1" />
                    Torna al post
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900">Modifica Post</h1>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                <EditPostForm post={post} categories={categories} />
            </div>
        </div>
    );
}
