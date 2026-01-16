import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Plus, BarChart2 } from "lucide-react";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import PollCard from "@/app/(protected)/polls/PollCard";

async function getPolls(user: SessionUser) {
    const classId = user.classId;
    return await prisma.poll.findMany({
        where: {
            OR: [
                { schoolWide: true }, // Global
                { classId: classId || undefined } // Class specific
            ]
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
                    roles: {
                        select: { role: true }
                    }
                }
            }
        },
        orderBy: [
             { endsAt: 'desc' }, // Active first (if null, sort logic might vary, usually nulls last? Prisma sorts nulls last/first depending on DB, assume created recent first is better backup)
             { createdAt: 'desc' }
        ]
    });
}

export default async function PollsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    const polls = await getPolls(user);
    
    // Split polls
    const schoolPolls = polls.filter(p => p.schoolWide);
    const classPolls = polls.filter(p => !p.schoolWide);

    const canCreateGlobal = userHasPermission(user, "CREATE_GLOBAL_POLL");
    const canCreateClass = userHasPermission(user, "CREATE_CLASS_POLL");
    const canCreate = canCreateGlobal || canCreateClass;
    const canVotePermission = userHasPermission(user, "VOTE_POLLS");

    const renderPollList = (sectionPolls: typeof polls, title: string, icon: React.ReactNode) => {
        if (sectionPolls.length === 0) return null;
        return (
             <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 px-1">
                     <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                         {icon}
                     </div>
                     <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{sectionPolls.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sectionPolls.map(poll => {
                        const userVote = poll.votes[0]?.optionId;
                        const totalVotes = poll.options.reduce((acc, opt) => acc + opt._count.votes, 0);
                        const isExpired = poll.endsAt ? new Date() > poll.endsAt : false;
                        
                        const canVote = canVotePermission && !userVote && !isExpired;

                        const isOwner = poll.createdById === user.id;
                        const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');
                        const canManage = isOwner || hasAdminPower;
                        const forceShowResults = isOwner || hasAdminPower;
                        
                        return (
                            <PollCard 
                                key={poll.id}
                                id={poll.id}
                                question={poll.question}
                                options={poll.options}
                                endsAt={poll.endsAt}
                                userVotedOptionId={userVote}
                                totalVotes={totalVotes}
                                canVote={canVote}
                                canManage={canManage}
                                creator={poll.createdBy}
                                schoolWide={poll.schoolWide}
                                forceShowResults={forceShowResults}
                            />
                        );
                    })}
                </div>
             </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 px-4 md:px-0">
                <div>
                   <h1 className="text-3xl font-bold text-gray-900">Sondaggi</h1>
                   <p className="text-gray-600">Esprimi la tua opinione.</p>
                </div>
                {canCreate && (
                    <Link href="/polls/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center gap-2">
                        <Plus size={20} />
                        <span className="hidden md:inline">Nuovo Sondaggio</span>
                    </Link>
                )}
            </div>

            <div className="px-4 md:px-0">
                {polls.length === 0 ? (
                    <div className="py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                        <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nessun sondaggio attivo</h3>
                        <p className="text-gray-500">Torna più tardi per nuove votazioni.</p>
                    </div>
                ) : (
                    <>
                        {renderPollList(schoolPolls, "Sondaggi d'Istituto", <BarChart2 size={20} />)}
                        {renderPollList(classPolls, "Sondaggi di Classe", <BarChart2 size={20} />)}
                    </>
                )}
            </div>
        </div>
    );
}

