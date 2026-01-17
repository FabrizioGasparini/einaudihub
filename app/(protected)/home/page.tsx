import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Calendar, AlertCircle, Plus, MessageCircle, Sparkles, TrendingUp, Bell, ArrowRight, BarChart2, Link2, BookOpen, Utensils, GraduationCap, Globe, Users } from "lucide-react";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import EventCard from "../events/EventCard";
import AnnouncementCard from "../announcements/AnnouncementCard";
import { FadeIn, SlideIn, ScaleIn, StaggerContainer } from "@/components/MotionWrappers";

async function getAnnouncements(user: SessionUser) {
  // Fetch global announcements AND class announcements if user has a class
  const classId = user.classId;

  // Filter conditions:
  // 1. Official announcements (isOfficial = true)
  // 2. Class announcements (classId = user.classId) IF user has a class
  
  const whereConditions: any[] = [
     { isOfficial: true }
  ];
  
  if (classId) {
      whereConditions.push({ classId: classId });
  }

  return await prisma.announcement.findMany({
    where: {
      OR: whereConditions
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { createdBy: true }
  });
}

async function getUpcomingEvents(user: SessionUser) {
    const classId = user.classId;
    
    const whereConditions: any[] = [
        { classId: null } // Global events
    ];
    
    if (classId) {
        whereConditions.push({ classId: classId });
    }
    
    return await prisma.event.findMany({
        where: {
            date: { gte: new Date() },
            OR: whereConditions
        },
        orderBy: { date: 'asc' },
        take: 3,
        include: { _count: { select: { participations: true } } }
    });
}

async function getUnreadConversations(user: SessionUser) {
    return await prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId: user.id, hasUnread: true }
            }
        },
        include: {
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            participants: { include: { user: true } }
        },
        take: 3
    });
}

async function getActivePolls(user: SessionUser) {
    const classId = user.classId;
    
    const whereConditions: any[] = [
        { schoolWide: true }
    ];
    
    if (classId) {
        whereConditions.push({ classId: classId });
    }
    
    return await prisma.poll.findMany({
        where: {
            AND: [
                { OR: whereConditions },
                {
                    OR: [
                        { endsAt: null },
                        { endsAt: { gt: new Date() } }
                    ]
                }
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { 
             _count: { select: { votes: true } }
        }
    });
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const user = session.user as SessionUser;
  
  const announcements = await getAnnouncements(user);
  const events = await getUpcomingEvents(user);
  const unreadChats = await getUnreadConversations(user);
  const activePolls = await getActivePolls(user);

  const canCreateEvent = userHasPermission(user, "CREATE_SCHOOL_EVENT") || userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT");
  const canModeratePublic = userHasPermission(user, "MODERATE_PUBLIC_BOARD");
  const canModerateClass = userHasPermission(user, "MODERATE_CLASS_CONTENT");
  
  return (
    <div className="relative min-h-screen">
       {/* Background Decoration (Animated Blobs) */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[5%] right-[5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[80px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-[80px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }}></div>
            <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }}></div>
       </div>

      <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <ScaleIn>
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-white mb-6 group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-100 font-bold mb-2 uppercase tracking-wider text-xs">
                        <Sparkles size={14} className="text-yellow-300" /> EinaudiHub Dashboard
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        Ciao, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">{user.name.split(" ")[0]}</span>!
                    </h1>
                    <p className="text-blue-100 text-lg max-w-lg leading-relaxed opacity-90">
                        {user.classId 
                            ? `Tutto pronto per la tua giornata scolastica. Ecco gli ultimi aggiornamenti della tua classe e dell'istituto.`
                            : `Benvenuto su EinaudiHub. Esplora gli eventi e rimani aggiornato.`
                        }
                    </p>
                </div>

                {canCreateEvent && (
                    <Link href="/board/new?type=EVENT" className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                        <Plus size={20} />
                        Crea Nuovo Evento
                    </Link>
                )}
            </div>
        </div>
      </ScaleIn>

        {/* Incoming Messages Section */}
        {unreadChats.length > 0 && (
            <SlideIn direction="bottom" delay={0.2}>
            <div className="bg-white/60 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-lg">Messaggi recenti</h2>
                            <p className="text-xs text-gray-500 font-medium">Hai {unreadChats.length} conversazioni non lette</p>
                        </div>
                    </div>
                    <Link href="/chat" className="text-blue-600 text-sm font-bold hover:underline">Vedi tutti</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unreadChats.map(chat => {
                         const other = chat.participants.find(p => p.userId !== user.id)?.user;
                         const lastMsg = chat.messages[0];
                         return (
                             <Link key={chat.id} href={`/chat/${chat.id}`} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
                                 <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg shadow-inner group-hover:scale-105 transition-transform">
                                        {other?.name?.[0]}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{other?.name}</p>
                                     <p className="text-sm text-gray-500 truncate">{lastMsg?.content || "Nuovo messaggio"}</p>
                                 </div>
                                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                             </Link>
                         );
                    })}
                </div>
            </div>
            </SlideIn>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed: Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.3}>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 py-2">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Bell size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">Avvisi in evidenza</h2>
            </div>
            <Link href="/announcements" className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                Vedi tutti <ArrowRight size={16} />
            </Link>
          </div>

          <StaggerContainer delay={0.4} className="space-y-4">
            {announcements.length === 0 ? (
                <div className="bg-white/50 p-10 rounded-3xl border-2 border-dashed border-gray-200 text-center text-gray-400 flex flex-col items-center gap-2">
                    <Bell size={40} className="text-gray-200" />
                    <p>Nessun avviso recente da visualizzare.</p>
                </div>
            ) : (
                announcements.map((ann) => (
                    <div key={ann.id} className="transform transition-all duration-300 hover:scale-[1.01]">
                        <AnnouncementCard 
                            announcement={ann}
                            currentUserId={user.id}
                            canModeratePublic={canModeratePublic}
                            canModerateClass={canModerateClass}
                        />
                    </div>
                ))
            )}
          </StaggerContainer>
          </FadeIn>
          
          {/* Active Polls Widget */}
          <SlideIn direction="right" delay={0.5}>
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <BarChart2 size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Sondaggi Attivi</h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                    {activePolls.length === 0 ? (
                         <div className="p-6 text-center text-gray-400">
                             Nessun sondaggio attivo al momento.
                         </div>
                    ) : (
                        activePolls.map(poll => (
                            <Link href="/polls" key={poll.id} className="block p-4 hover:bg-gray-50 transition-colors">
                                <h3 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1">{poll.question}</h3>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{poll.schoolWide ? 'Istituto' : 'Classe'}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full font-bold ${poll.endsAt ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {poll.endsAt ? `Scade il ${poll.endsAt.toLocaleDateString()}` : 'Senza scadenza'}
                                        </span>
                                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                            {poll._count.votes} voti
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                    <Link href="/polls" className="block text-center p-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-wider">
                        Vai ai sondaggi
                    </Link>
                </div>
            </div>
          </SlideIn>
        </div>

        {/* Sidebar: Events & Quick Info */}
        <div className="space-y-8">
          
          {/* Events */}
          <SlideIn direction="right" delay={0.4}>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Calendar size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Prossimi Eventi</h2>
                </div>
            </div>
            
            <div className="space-y-3">
               {events.length === 0 ? (
                   <div className="bg-white/50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                        Nessun evento in programma.
                   </div>
               ) : (
                   events.map(ev => (
                       <div key={ev.id} className="transform transition-all hover:-translate-x-1">
                           <EventCard event={ev} />
                       </div>
                   ))
               )}
            </div>
            
             <Link href="/events" className="block text-center p-3 rounded-xl bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 hover:text-gray-900 transition-colors">
                Vedi tutti gli eventi
            </Link>
          </div>
          </SlideIn>

          {/* Quick Actions Grid */}
          <ScaleIn delay={0.6}>
              <div className="space-y-4">
                 <div className="flex items-center gap-2 px-2">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Sparkles size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Accesso Rapido</h2>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                      {/* My Class Board */}
                      <Link href="/board" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all group text-center cursor-pointer">
                         <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                             <Users size={24} />
                         </div>
                         <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">La mia Classe</span>
                      </Link>

                       {/* Create Content */}
                       <Link href="/board/new" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md hover:border-green-200 hover:-translate-y-1 transition-all group text-center cursor-pointer">
                         <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                             <Plus size={24} />
                         </div>
                         <span className="text-sm font-bold text-gray-700 group-hover:text-green-600">Crea Post</span>
                      </Link>
                       
                       {/* All Polls */}
                       <Link href="/polls" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all group text-center cursor-pointer">
                         <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                             <BarChart2 size={24} />
                         </div>
                         <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">Sondaggi</span>
                      </Link>

                       {/* School Board */}
                       <Link href="/announcements" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md hover:border-orange-200 hover:-translate-y-1 transition-all group text-center cursor-pointer">
                         <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                             <Bell size={24} />
                         </div>
                         <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600">Avvisi</span>
                      </Link>
                 </div>
              </div>
          </ScaleIn>

        </div>
      </div>
      </div>
    </div>
  );
}

