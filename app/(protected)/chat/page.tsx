import { getConversations, getReps } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import Link from "next/link";
import { MessageSquare, MessageCircle, ChevronRight, BadgeCheck } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import AutoRefresh from "@/components/AutoRefresh";
import { FadeIn, ScaleIn, StaggerContainer } from "@/components/MotionWrappers";
import ChatSearch from "./ChatSearch";
import StartChatButton from "./StartChatButton";

export default async function ChatListPage() {
    const session = await getServerSession(authOptions);
    const conversations = await getConversations();
    const reps = await getReps();
    const currentUserId = (session?.user as SessionUser)?.id;

    return (
        <div className="relative min-h-screen pb-24 overflow-hidden bg-stone-50">
             {/* Background Decoration */}
             <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-b from-purple-200 to-transparent opacity-40 blur-[100px] rounded-full animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-gradient-to-t from-indigo-200 to-transparent opacity-40 blur-[100px] rounded-full animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
                <AutoRefresh intervalMs={10000} /> 
                
                <ScaleIn>
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden mb-10">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <MessageSquare size={200} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide border border-white/20">
                                        Messaggistica
                                    </span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tight mb-2">Le tue Conversazioni</h1>
                                <p className="text-indigo-100/90 text-lg max-w-xl font-medium">
                                    Connettiti con compagni e docenti.
                                </p>
                            </div>
                        </div>
                    </div>
                </ScaleIn>

                {/* Reps Horizontal Scroll */}
                <FadeIn delay={0.2}>
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Rappresentanti</h2>
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {reps.length}
                            </span>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x items-center">
                            {reps.map(rep => {
                                const isSchoolRep = rep.roles.some((r: any) => r.role === "SCHOOL_REP");
                                
                                return (
                                    <StartChatButton 
                                        key={rep.id} 
                                        targetUser={rep}
                                        className="snap-start flex-shrink-0 flex flex-col items-center gap-2 group w-[72px]"
                                        title={`Scrivi a ${rep.name}`}
                                    >
                                        <div className="relative">
                                            <div className={`w-16 h-16 rounded-full p-[2px] shadow-md group-hover:scale-105 transition-transform
                                                ${isSchoolRep 
                                                    ? 'bg-gradient-to-tr from-amber-400 to-orange-500' 
                                                    : 'bg-gradient-to-tr from-indigo-400 to-blue-500'}`}>
                                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                                                     {rep.avatarUrl ? (
                                                        <img src={rep.avatarUrl} alt={rep.name} className="w-full h-full object-cover" />
                                                     ) : (
                                                        <span className={`text-xl font-bold ${isSchoolRep ? 'text-amber-500' : 'text-indigo-500'}`}>
                                                            {rep.name[0]}
                                                        </span>
                                                     )}
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                <BadgeCheck size={16} className={isSchoolRep ? "text-amber-500 fill-amber-50" : "text-indigo-500 fill-indigo-50"} />
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight line-clamp-2 w-full break-words">
                                            {rep.name.split(" ")[0]}
                                        </span>
                                    </StartChatButton>
                                )
                            })}
                            
                            {reps.length === 0 && (
                                <div className="text-sm text-gray-400 italic px-2">Nessun rappresentante trovato.</div>
                            )}
                        </div>
                    </div>
                </FadeIn>

                <div className="max-w-xl mx-auto">
                    {/* Search */}
                    <FadeIn delay={0.3}>
                         <div className="mb-8">
                             <ChatSearch />
                         </div>
                    </FadeIn>

                    {/* Conversation List */}
                    <div className="flex items-center justify-between mb-4 px-2">
                         <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recenti</h2>
                    </div>
                    
                    <StaggerContainer className="space-y-3">
                        {conversations.length === 0 ? (
                            <FadeIn>
                                <div className="text-center py-16 px-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                                    <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                        <MessageCircle size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun messaggio</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Cerca uno studente qui sopra per iniziare una conversazione.
                                    </p>
                                </div>
                            </FadeIn>
                        ) : (
                            conversations.map(conv => {
                                const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUserId)?.user;
                                const myParticipant = conv.participants.find((p: any) => p.userId === currentUserId);
                                const hasUnread = myParticipant?.hasUnread;
                                const lastMessage = conv.messages[0];

                                return (
                                    <div key={conv.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                                        <Link 
                                            href={`/chat/${conv.id}`}
                                            className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group
                                                ${hasUnread 
                                                    ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-100/50' 
                                                    : 'bg-white/80 border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-white'
                                                }`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md transition-transform group-hover:scale-110
                                                    ${hasUnread ? 'bg-gradient-to-tr from-indigo-600 to-violet-600' : 'bg-gradient-to-tr from-gray-400 to-slate-500'}`}>
                                                    {otherParticipant?.name?.[0] || "?"}
                                                </div>
                                                
                                                {/* Unread Indicator */}
                                                {hasUnread && (
                                                    <span className="absolute 0 right-0 flex h-4 w-4 transform translate-x-1 translate-y-1">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className={`text-base truncate ${hasUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                                        {otherParticipant?.name || "Utente sconosciuto"}
                                                    </h3>
                                                    <span className={`text-[10px] whitespace-nowrap font-medium ${hasUnread ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                        {lastMessage && new Date(lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm truncate max-w-[85%] ${hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                                        {lastMessage?.content || "Nessun messaggio"}
                                                    </p>
                                                    {hasUnread && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                                                </div>
                                            </div>
                                            
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                                                <ChevronRight size={20} />
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </StaggerContainer>
                </div>
            </div>
        </div>
    );
}

