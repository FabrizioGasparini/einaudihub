import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Plus, BarChart2, Vote, Sparkles } from "lucide-react";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import PollCard from "@/app/(protected)/polls/PollCard";
import { FadeIn, ScaleIn, SlideIn, StaggerContainer } from "@/components/MotionWrappers";

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
             { endsAt: 'desc' }, 
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
                <SlideIn direction="top">
                    <div className="flex items-center gap-3 mb-6 px-1">
                        <div className="p-2.5 bg-blue-100/50 backdrop-blur-sm rounded-xl text-blue-600 shadow-sm">
                            {icon}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h2>
                        <span className="bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-200">
                            {sectionPolls.length}
                        </span>
                    </div>
                </SlideIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sectionPolls.map(poll => {
                        const userVote = poll.votes[0]?.optionId;
                        const totalVotes = poll.options.reduce((acc, opt) => acc + opt._count.votes, 0);
                        const isExpired = poll.endsAt ? new Date() > poll.endsAt : false;
                        
                        // FIX: Allow changing vote (so don't check !userVote here)
                        const canVote = canVotePermission && !isExpired;

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
                </StaggerContainer>
             </div>
        );
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-blue-300/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
                <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-cyan-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
                <div className="absolute top-[40%] left-[30%] w-80 h-80 bg-teal-200/20 rounded-full blur-[80px] animate-blob animation-delay-4000 mix-blend-multiply filter"></div>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <ScaleIn>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-900 shadow-2xl p-8 mb-8 text-white">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Vote size={180} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                        <BarChart2 className="text-indigo-300" size={20} />
                                    </div>
                                    <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs">Votazioni</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tight mb-2 text-white">
                                    Sondaggi
                                </h1>
                                <p className="text-indigo-200 text-lg max-w-xl font-light">
                                    La tua opinione conta. Partecipa alle decisioni della scuola.
                                </p>
                            </div>
                            
                            {canCreate && (
                                <Link 
                                    href="/board/new?type=POLL" 
                                    className="group relative px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Plus className="group-hover:rotate-90 transition-transform duration-300" size={20} />
                                    <span>Nuovo Sondaggio</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </ScaleIn>

                <div className="px-1">
                    {polls.length === 0 ? (
                        <FadeIn>
                            <div className="py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-dashed border-gray-300/50 shadow-sm text-center">
                                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                                    <BarChart2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Nessun sondaggio attivo</h3>
                                <p className="text-gray-500">
                                    Non ci sono votazioni in corso al momento.
                                </p>
                            </div>
                        </FadeIn>
                    ) : (
                        <>
                            {renderPollList(schoolPolls, "Sondaggi d'Istituto", <Vote size={20} />)}
                            {renderPollList(classPolls, "Sondaggi di Classe", <BarChart2 size={20} />)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

