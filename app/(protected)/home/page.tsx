import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Calendar, AlertCircle, Plus, MessageCircle } from "lucide-react";
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

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const user = session.user as SessionUser;
  
  const announcements = await getAnnouncements(user);
  const events = await getUpcomingEvents(user);
  const unreadChats = await getUnreadConversations(user);

  const canCreateEvent = userHasPermission(user, "CREATE_SCHOOL_EVENT") || userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT");
  const canModeratePublic = userHasPermission(user, "MODERATE_PUBLIC_BOARD");
  const canModerateClass = userHasPermission(user, "MODERATE_CLASS_CONTENT");
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bentornato, {user.name.split(" ")[0]}!</h1>
          <p className="text-gray-600 mt-1">
             Ecco cosa succede oggi all'Einaudi.
             {user.classId ? <span> (Classe supportata)</span> : <span className="text-amber-600"> (Nessuna classe associata)</span>}
          </p>
        </div>
        
        {canCreateEvent && (
           <div className="flex gap-2">
             <Link href="/events/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus size={18} />
                <span>Crea Contenuto</span>
             </Link>
           </div>
        )}
      </div>
      </FadeIn>

        {/* Incoming Messages Section */}
        {unreadChats.length > 0 && (
            <ScaleIn delay={0.2}>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="text-blue-600" size={20} />
                    <h2 className="font-bold text-blue-900">Messaggi in arrivo</h2>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadChats.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {unreadChats.map(chat => {
                         const other = chat.participants.find(p => p.userId !== user.id)?.user;
                         const lastMsg = chat.messages[0];
                         return (
                             <Link key={chat.id} href={`/chat/${chat.id}`} className="block bg-white p-3 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-all group">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                                         {other?.name?.[0]}
                                     </div>
                                     <div className="min-w-0">
                                         <p className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600">{other?.name}</p>
                                         <p className="text-xs text-gray-500 truncate">{lastMsg?.content}</p>
                                     </div>
                                     <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                                 </div>
                             </Link>
                         );
                    })}
                </div>
            </div>
            </ScaleIn>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed: Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.3}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Avvisi Recenti</h2>
            <Link href="/announcements" className="text-sm text-blue-600 hover:underline">Vedi tutti</Link>
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
                <div className="bg-white p-6 rounded-3xl border border-dashed text-center text-gray-400">
                    Nessun avviso recente.
                </div>
            ) : (
                announcements.map((ann) => (
                    <AnnouncementCard 
                        key={ann.id} 
                        announcement={ann}
                        currentUserId={user.id}
                        canModeratePublic={canModeratePublic}
                        canModerateClass={canModerateClass}
                    />
                ))
            )}
          </div>
          </FadeIn>
        </div>

        {/* Sidebar: Events & Quick Info */}
        <div className="space-y-8">
          
          {/* Events */}
          <SlideIn direction="right" delay={0.4}>
          <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Prossimi Eventi</h2>
            </div>
            
            <div className="space-y-4">
               {events.length === 0 ? (
                   <div className="bg-white p-6 rounded-3xl border border-dashed text-center text-gray-400">
                        Nessun evento in programma.
                   </div>
               ) : (
                   events.map(ev => (
                       <EventCard key={ev.id} event={ev} />
                   ))
               )}
            </div>
            
             <Link href="/events" className="mt-4 block text-center text-sm text-blue-600 font-bold hover:underline">
                Vedi tutti gli eventi
            </Link>
          </div>
          </SlideIn>

          {/* User Status / Quick Poll */}
          <ScaleIn delay={0.5}>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
             
             {/* Decor */}
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl"></div>

             <h3 className="font-bold text-lg mb-2 relative z-10">La tua opinione conta</h3>
             <p className="text-sm text-purple-100 mb-6 relative z-10 opacity-90 leading-relaxed">
                 Partecipa ai sondaggi attivi per migliorare la scuola.
             </p>
             <Link href="/polls" className="relative z-10 w-full block text-center bg-white text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition-colors text-sm font-bold shadow-sm">
                 Vai ai Sondaggi
             </Link>
          </div>
          </ScaleIn>

        </div>
      </div>
    </div>
  );
}

