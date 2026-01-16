import { getConversations, getSchoolReps } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import Link from "next/link";
import { MessageSquarePlus, ChevronRight, Search } from "lucide-react";
import StartChatButton from "./StartChatButton";
import type { SessionUser } from "@/lib/types";
import AutoRefresh from "@/components/AutoRefresh";

export default async function ChatListPage() {
    const session = await getServerSession(authOptions);
    const conversations = await getConversations();
    const reps = await getSchoolReps();
    const currentUserId = (session?.user as SessionUser)?.id;

    return (
        <div className="max-w-2xl mx-auto py-6 px-4 pb-24">
            <AutoRefresh intervalMs={10000} /> {/* Poll list every 10s */}
            
            <div className="flex justify-between items-center mb-6">
                <div>
                     <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Messaggi</h1>
                     <p className="text-gray-500 text-sm">Le tue conversazioni private</p>
                </div>
                {/* Placeholder for future specific "New Chat" button if not using reps */}
            </div>

            {/* Quick Access to Reps (Story-like Avatars) */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rappresentanti Online</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {reps.map(rep => (
                        <div key={rep.id} className="flex flex-col items-center gap-1 min-w-[64px]">
                           <StartChatButton targetUser={rep} />
                           <span className="text-[10px] font-medium text-gray-600 truncate max-w-full">{rep.name.split(' ')[0]}</span>
                        </div>
                    ))}
                     {reps.length === 0 && <p className="text-sm text-gray-400 italic">Nessun rappresentante disponibile.</p>}
                </div>
            </section>

            {/* Search Bar (Visual Only) */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cerca conversazioni..." 
                    className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-3 pl-10 pr-4 transition-all text-sm font-medium"
                    disabled 
                />
            </div>

            {/* Conversation List */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {conversations.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquarePlus size={32} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Nessun messaggio</h3>
                        <p className="text-gray-500 text-sm">Contatta un rappresentante per iniziare una chat.</p>
                    </div>
                ) : (
                    conversations.map(conv => {
                        const otherParticipant = conv.participants.find((p: any) => p.userId !== currentUserId)?.user;
                        const myParticipant = conv.participants.find((p: any) => p.userId === currentUserId);
                        const hasUnread = myParticipant?.hasUnread;
                        const lastMessage = conv.messages[0];

                        return (
                            <Link 
                                key={conv.id} 
                                href={`/chat/${conv.id}`}
                                className={`group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors relative ${hasUnread ? 'bg-blue-50/40' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                                        {otherParticipant?.name?.[0] || "?"}
                                    </div>
                                    {/* Unread Dot */}
                                    {hasUnread && (
                                        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full animate-pulse"></div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`text-base text-gray-900 truncate ${hasUnread ? 'font-black' : 'font-medium'}`}>
                                            {otherParticipant?.name || "Utente sconosciuto"}
                                        </h3>
                                        <span className={`text-xs whitespace-nowrap ${hasUnread ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                            {lastMessage && new Date(lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                        {lastMessage ? lastMessage.content : <span className="italic">Nessun messaggio</span>}
                                    </p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${hasUnread ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                            </Link>
                        );
                    })
                )}
            </section>
        </div>
    );
}
