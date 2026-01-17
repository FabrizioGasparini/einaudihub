import { FadeIn, ScaleIn, StaggerContainer } from "@/components/MotionWrappers";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Users, BookOpen, Calendar, MessageSquare, Plus, ArrowRight, GraduationCap, BadgeCheck } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { userHasPermission } from "@/lib/authz";
import DeleteAnnouncementButton from "../announcements/DeleteAnnouncementButton";

// Helper components for "Feed" cards - reusing existing styling logic but simplified
import PostCard from "@/app/(protected)/board/PostCard";
import EventCard from "@/app/(protected)/events/EventCard";
import AnnouncementCard from "@/app/(protected)/announcements/AnnouncementCard";
import PollCard from "@/app/(protected)/polls/PollCard";

type PageProps = {
    searchParams: Promise<{ adminViewClassId?: string }>;
}

export default async function MyClassPage(props: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;
    
    // Check permissions
    const canModerateClass = userHasPermission(user, "MODERATE_CLASS_CONTENT");
    
    const searchParams = await props.searchParams;
    const adminViewClassId = searchParams.adminViewClassId;
    
    const userRoles = user.roles.map(r => r.role);
    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('MODERATOR');

    let targetClassId = user.classId;
    if (isAdmin && adminViewClassId) {
        targetClassId = adminViewClassId;
    }

    if (!targetClassId) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4 text-center">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Classe non assegnata</h1>
                    <p className="text-gray-600 mb-6">
                        Sembra che tu non sia associato a nessuna classe. Contatta la segreteria o un amministratore per aggiornare il tuo profilo.
                    </p>
                    <Link href="/home" className="inline-flex items-center text-blue-600 font-bold hover:underline">
                        Torna alla Home <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>
            </div>
        );
    }

    // Parallel data fetching for dashboard efficiency
    const [classInfo, classmates, classPosts, classEvents, classAnnouncements, classPolls] = await Promise.all([
        prisma.class.findUnique({
            where: { id: targetClassId }
        }),
        prisma.user.findMany({
            where: { classId: targetClassId },
            select: { id: true, name: true, avatarUrl: true, roles: { select: { role: true } } },
            orderBy: { name: 'asc' }
        }),
        prisma.post.findMany({
            where: { classId: targetClassId, isHidden: false },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { 
                author: {
                    include: { roles: true }
                }, 
                category: true, 
                _count: { select: { comments: true, likes: true } },
                likes: { where: { userId: user.id }, select: { userId: true } }
            }
        }),
        prisma.event.findMany({
            where: { classId: targetClassId, date: { gte: new Date() } },
            orderBy: { date: 'asc' },
            take: 3,
            include: { createdBy: true, _count: { select: { participations: true } } }
        }),
        prisma.announcement.findMany({
            where: { classId: targetClassId },
            orderBy: { createdAt: 'desc' },
            take: 2,
            include: { createdBy: true }
        }),
        prisma.poll.findMany({
            where: { 
                classId: targetClassId, 
                OR: [
                    { endsAt: { gte: new Date() } }, 
                    { endsAt: null }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 2,
            include: {
                options: { include: { _count: { select: { votes: true } } } },
                votes: { where: { userId: user.id }, select: { optionId: true } },
                createdBy: { select: { name: true, roles: { select: { role: true } } } }
            }
        })
    ]);

    if (!classInfo) return <div>Errore caricamento classe</div>;
    
    // Sort Classmates: School Rep > Class Rep > Others
    const sortedClassmates = [...classmates].sort((a, b) => {
        const getPriority = (mate: typeof classmates[0]) => {
            if (mate.roles.some(r => r.role === 'SCHOOL_REP')) return 3;
            if (mate.roles.some(r => r.role === 'CLASS_REP')) return 2;
            return 1;
        };
        const pA = getPriority(a);
        const pB = getPriority(b);
        if (pA !== pB) return pB - pA; // Descending priority
        return a.name.localeCompare(b.name);
    });

    const reps = classmates.filter(c => c.roles.some(r => r.role === 'CLASS_REP'));

    return (
        <div className="relative min-h-screen pb-20 overflow-hidden bg-stone-50">
             {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-b from-blue-200 to-transparent opacity-40 blur-[80px] rounded-full animate-blob"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-t from-cyan-200 to-transparent opacity-40 blur-[80px] rounded-full animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                
                {/* Header Section */}
                <ScaleIn>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-900 shadow-2xl p-8 mb-8 text-white">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                             <GraduationCap size={180} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                    <Users className="text-indigo-300" size={20} />
                                </div>
                                <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs">La Tua Classe</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight mb-2 text-white">
                                Classe {classInfo.year}{classInfo.section}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-indigo-100 mt-4">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <Users size={18} />
                                    <span className="font-medium">{classmates.length} Studenti</span>
                                </div>
                                {reps.length > 0 && (
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                                        <BadgeCheck size={18} />
                                        <span className="font-medium">Rappresentanti: {reps.map(r => r.name.split(' ')[0]).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScaleIn>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                     {/* Left Column: Sidebar (Events & Mates) */}
                    <div className="space-y-6 order-2 lg:order-1">
                        
                         {/* Classmates Widget */}
                         <section>
                             <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <Users size={18} />
                                    </div>
                                    Compagni
                                </h2>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50 flex flex-col max-h-[500px]">
                                <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    {sortedClassmates.map( mate => {
                                        const isSchoolRep = mate.roles.some(r => r.role === 'SCHOOL_REP');
                                        const isClassRep = mate.roles.some(r => r.role === 'CLASS_REP');
                                        
                                        return (
                                            <div key={mate.id} className={`flex items-center gap-3 p-2 rounded-xl transition-all ${isSchoolRep ? 'bg-amber-50/50 hover:bg-amber-50' : isClassRep ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-gray-50'}`}>
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white
                                                    ${isSchoolRep ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700' : 
                                                      isClassRep ? 'bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-700' : 
                                                      'bg-gray-100 text-gray-500'}`}>
                                                    {mate.name[0]}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-sm font-semibold truncate ${isSchoolRep || isClassRep ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {mate.name}
                                                        </p>
                                                        {/* Badges */}
                                                        {isSchoolRep && (
                                                            <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/50 shadow-sm">
                                                                Istituto
                                                            </span>
                                                        )}
                                                        {!isSchoolRep && isClassRep && (
                                                             <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/50 shadow-sm">
                                                                Classe
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-gray-50/80 p-3 text-center border-t border-gray-100 backdrop-blur-sm">
                                    <p className="text-xs text-gray-500 font-medium">Totale: {sortedClassmates.length} studenti</p>
                                </div>
                            </div>
                        </section>

                        {/* Events Widget */}
                         <section>
                             <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                                        <Calendar size={18} />
                                    </div>
                                    Eventi
                                </h2>
                                <Link href="/events" className="text-xs font-bold text-gray-500 hover:text-gray-900">Vedi tutti</Link>
                            </div>
                            
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                                {classEvents.length > 0 ? (
                                    <div className="space-y-2">
                                        {classEvents.map(event => (
                                            <Link href={`/events/${event.id}`} key={event.id} className="block group">
                                                <div className="flex gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex flex-col items-center justify-center border border-rose-100 group-hover:border-rose-200 transition-colors">
                                                        <span className="text-[10px] font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-lg font-extrabold leading-none">{new Date(event.date).getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-0.5">
                                                        <h4 className="font-bold text-gray-900 truncate group-hover:text-rose-600 transition-colors">{event.title}</h4>
                                                        <p className="text-xs text-gray-500 truncate">{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {event.location || 'Online'}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-sm text-gray-400">Nessun evento in programma</div>
                                )}
                            </div>
                        </section>

                    </div>


                    {/* Right/Center Column: Feed */}
                    <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
                        
                         {/* Create Post Prompt */}
                        <FadeIn>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    {user.name.charAt(0)}
                                </div>
                                <Link href="/board/new?type=POST&scope=CLASS" className="flex-1 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 text-sm py-3 px-4 rounded-xl text-left border border-transparent hover:border-gray-200">
                                    Scrivi qualcosa alla tua classe...
                                </Link>
                                <Link href="/board/new?type=POST&scope=CLASS" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg">
                                    <Plus size={20} />
                                </Link>
                            </div>
                        </FadeIn>


                         {/* Announcements */}
                        <section>
                            <StaggerContainer className="space-y-4">
                                {classAnnouncements.length > 0 && classAnnouncements.map(ann => (
                                     <div key={ann.id} className="relative group">
                                         <AnnouncementCard announcement={ann as any} className="border-l-4 border-l-amber-400" />
                                          {/* Delete Button Injection */}
                                          {(canModerateClass || ann.createdById === user.id) && (
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DeleteAnnouncementButton id={ann.id} />
                                            </div>
                                        )}
                                     </div>
                                ))}
                            </StaggerContainer>
                        </section>

                        {/* Polls Section */}
                        {classPolls.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4 px-2">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                         <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                            <BadgeCheck size={20} />
                                        </div>
                                        Sondaggi Attivi
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {classPolls.map(poll => {
                                        const totalVotes = poll.options.reduce((acc, opt) => acc + opt._count.votes, 0);
                                        const userVote = poll.votes[0]?.optionId;
                                        const isOwner = poll.createdById === user.id;
                                        const isAdmin = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

                                        return (
                                            <PollCard 
                                                key={poll.id}
                                                id={poll.id}
                                                question={poll.question}
                                                options={poll.options}
                                                endsAt={poll.endsAt}
                                                userVotedOptionId={userVote}
                                                totalVotes={totalVotes}
                                                canVote={!poll.endsAt || new Date() < poll.endsAt}
                                                canManage={isOwner || isAdmin}
                                                creator={poll.createdBy}
                                                schoolWide={false}
                                            />
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Posts */}
                         <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <MessageSquare size={20} />
                                    </div>
                                    Bacheca
                                </h2>
                            </div>

                             <StaggerContainer className="space-y-6">
                                {classPosts.length > 0 ? (
                                    classPosts.map(post => (
                                        <PostCard 
                                            key={post.id} 
                                            post={post as any} 
                                            currentUserId={user.id} 
                                            currentUserRoles={user.roles.map(r => r.role)}
                                             currentUserClassId={user.classId || undefined}
                                        />
                                    ))
                                ) : (
                                    <FadeIn>
                                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-gray-400">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                <MessageSquare size={32} />
                                            </div>
                                            <p>Nessuna discussione attiva</p>
                                        </div>
                                    </FadeIn>
                                )}
                            </StaggerContainer>
                             <div className="text-center pt-8">
                                <Link href="/board" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 px-4 py-2 rounded-full transition-colors bg-white border border-gray-200 shadow-sm hover:shadow-md">
                                    Vedi tutti i post <ArrowRight size={14} className="ml-1" />
                                </Link>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
