import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditPollForm from "./EditPollForm";
import type { SessionUser } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ pollId: string }>;
}

export default async function EditPollPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;
    
    const { pollId } = await params;

    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            options: {
                orderBy: { id: 'asc' } // Assuming consistent order is good
            }
        }
    });

    if (!poll) notFound();

    // Permission Check
    const isOwner = poll.createdById === user.id;
    const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

    if (!isOwner && !hasAdminPower) {
        // Redirect or show unauthorized
        redirect("/polls");
    }

    return (
        <div className="max-w-2xl mx-auto pb-20 pt-8 px-4">
             <div className="mb-8">
                <Link href="/polls" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4">
                    <ArrowLeft size={20} className="mr-1" />
                    Torna ai Sondaggi
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900">Modifica Sondaggio</h1>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                <EditPollForm poll={poll} />
            </div>
        </div>
    );
}
