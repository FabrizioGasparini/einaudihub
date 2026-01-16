import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Users, BookOpen, Calendar, MessageSquare, Plus, ArrowRight } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { userHasPermission } from "@/lib/authz";
import DeleteAnnouncementButton from "../announcements/DeleteAnnouncementButton";

// Helper components for "Feed" cards - reusing existing styling logic but simplified
import PostCard from "@/app/(protected)/board/PostCard";
import EventCard from "@/app/(protected)/events/EventCard";
import AnnouncementCard from "@/app/(protected)/announcements/AnnouncementCard";

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
    const [classInfo, classmates, classPosts, classEvents, classAnnouncements] = await Promise.all([
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
        })
    ]);

    if (!classInfo) return <div>Errore caricamento classe</div>;

    const reps = classmates.filter(c => c.roles.some(r => r.role === 'CLASS_REP'));

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-6 px-4 md:px-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-blue-200 font-bold tracking-wider text-xs uppercase mb-2">
                        <Users size={14} /> La Tua Classe
                    </div>
                    <h1 className="text-4xl font-extrabold mb-2">{classInfo.year}{classInfo.section}</h1>
                    <p className="text-blue-100 opacity-90">{classmates.length} Studenti • {reps.length > 0 ? `Rappresentanti: ${reps.map(r => r.name.split(' ')[0]).join(', ')}` : "Nessun Rappresentante"}</p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Events & Info */}
                <div className="space-y-6">
                    {/* Classmates Widget */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                       <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                            Compagni
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{classmates.length}</span>
                       </h3>
                       <div className="flex flex-wrap gap-2">
                           {classmates.map(mate => (
                               <div key={mate.id} title={mate.name} className="relative group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${mate.id === user.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-white bg-gray-100 text-gray-600'} shadow-sm`}>
                                        {mate.name.charAt(0)}
                                    </div>
                                    {mate.roles.some(r => r.role === 'CLASS_REP') && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" title="Rappresentante"></div>
                                    )}
                               </div>
                           ))}
                       </div>
                    </div>

                    {/* Upcoming Events Widget */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Prossimi Eventi</h3>
                            <Link href="/events" className="text-blue-600 text-xs font-bold hover:underline">Vedi tutti</Link>
                        </div>
                        {classEvents.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-sm">Nessun evento in programma.</div>
                        ) : (
                            <div className="space-y-3">
                                {classEvents.map(evt => (
                                    <Link href={`/events/${evt.id}`} key={evt.id} className="block group">
                                        <div className="bg-gray-50 group-hover:bg-blue-50 transition-colors p-3 rounded-xl border border-gray-100 group-hover:border-blue-100">
                                            <div className="text-xs font-bold text-blue-600 mb-1">
                                                {new Date(evt.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} • {new Date(evt.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="font-semibold text-gray-800 text-sm truncate">{evt.title}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTRE/RIGHT COLUMN: Feed (Announcements & Posts) */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Create Post Prompt */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <Link href="/board/new" className="flex-1 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 text-sm py-3 px-4 rounded-xl text-left">
                            Scrivi qualcosa alla tua classe...
                        </Link>
                    </div>

                    {/* Content Feed */}
                    <h3 className="font-bold text-lg text-gray-900 px-2">Bacheca di Classe</h3>

                    {classAnnouncements.length === 0 && classPosts.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed text-gray-500">
                            Nessuna attività recente nella tua classe.
                        </div>
                    )}

                    {/* Announcements First */}
                    {classAnnouncements.map(ann => (
                        <div key={ann.id} className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 shadow-sm relative group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                                        <MessageSquare size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Avviso di Classe</h4>
                                        <p className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                {/* Delete Button Injection */}
                                {(canModerateClass || ann.createdById === user.id) && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DeleteAnnouncementButton announcementId={ann.id} />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{ann.title}</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">{ann.content}</p>
                        </div>
                    ))}

                        {/* Posts */}
                    {classPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post as any} 
                            currentUserId={user.id} 
                            currentUserRoles={user.roles.map(r => r.role)}
                            currentUserClassId={user.classId || undefined}
                        />
                    ))}
                    
                    <div className="text-center pt-4">
                        <Link href="/board" className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors">
                            Vedi altri post
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
