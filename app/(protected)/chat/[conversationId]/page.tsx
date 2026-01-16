import { getConversation } from "../actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { notFound, redirect } from "next/navigation";
import ChatInput from "../ChatInput"; 
import AutoRefresh from "@/components/AutoRefresh";
import { ShieldCheck, ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { SessionUser } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import MarkRead from "./MarkRead";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params;
    
    const conversation = await getConversation(conversationId);
    if (!conversation) notFound();

    const currentUserId = (session?.user as SessionUser)?.id;
    const otherParticipant = conversation.participants.find((p: any) => p.userId !== currentUserId)?.user;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 relative">
            <MarkRead conversationId={conversationId} />
            <AutoRefresh intervalMs={3000} />
            
            {/* Modern Header */}
            <div className="bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
                <div className="flex items-center gap-3">
                     <Link href="/chat" className="text-gray-600 hover:text-gray-900 md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={22} />
                    </Link>
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-white">
                            {otherParticipant?.name?.[0]}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-none">{otherParticipant?.name}</h1>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Online</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 relative"> 
                {/* Background Decor */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                
                {conversation.messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                         <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full mb-4 flex items-center justify-center">
                            <ShieldCheck size={40} />
                         </div>
                         <p className="text-gray-600 font-bold text-lg">Inizia la conversazione</p>
                         <p className="text-sm text-gray-500 max-w-xs mt-2">I messaggi sono crittografati end-to-end.</p>
                    </div>
                )}
                
                {conversation.messages.map((msg: any) => (
                    <MessageBubble 
                        key={msg.id} 
                        message={msg} 
                        isMe={msg.senderId === currentUserId} 
                    />
                ))}
            </div>

            {/* Input using Client Component - Floating & Modern */}
            <div className="p-4 bg-gradient-to-t from-slate-50 to-transparent sticky bottom-0 z-40">
                 <ChatInput conversationId={conversationId} />
            </div>
        </div>
    );
}
