import { getConversation } from "../actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { notFound } from "next/navigation";
import ChatInput from "../ChatInput"; 
import AutoRefresh from "@/components/AutoRefresh";
import { ShieldCheck } from "lucide-react"; // Removed other icons
import type { SessionUser } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import MarkRead from "./MarkRead";
import { StaggerContainer } from "@/components/MotionWrappers";
import ChatHeader from "./ChatHeader";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params;
    
    const conversation = await getConversation(conversationId);
    if (!conversation) notFound();

    const currentUserId = (session?.user as SessionUser)?.id;
    const otherParticipant = conversation.participants.find((p: any) => p.userId !== currentUserId)?.user;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-stone-50 relative overflow-hidden">
             {/* Background Decoration */}
             <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-gradient-to-b from-blue-100 to-transparent opacity-40 blur-[80px] rounded-full animate-blob"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-gradient-to-t from-purple-100 to-transparent opacity-40 blur-[80px] rounded-full animate-blob animation-delay-2000"></div>
            </div>

            <MarkRead conversationId={conversationId} />
            <AutoRefresh intervalMs={3000} />
            
            <ChatHeader otherParticipant={otherParticipant} conversationId={conversationId} />

            {/* Messages Area - with StaggerContainer */}
            <div className="flex-1 overflow-y-auto p-4 pt-24 space-y-4 relative z-10 custom-scrollbar"> 
                {conversation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                         <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-3xl mb-6 flex items-center justify-center rotate-3 border-4 border-white shadow-xl">
                            <ShieldCheck size={48} />
                         </div>
                         <p className="text-gray-900 font-bold text-xl mb-1">Inizia la conversazione</p>
                         <p className="text-xs text-gray-500 max-w-xs bg-white/60 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                             🔒 Crittografia End-to-End
                         </p>
                    </div>
                ) : (
                    <StaggerContainer className="flex flex-col space-y-2 pb-4">
                        {conversation.messages.map((msg: any) => (
                            <MessageBubble 
                                key={msg.id} 
                                message={msg} 
                                isMe={msg.senderId === currentUserId} 
                            />
                        ))}
                    </StaggerContainer>
                )}
            </div>

            {/* Input using Client Component - Floating & Modern */}
            <div className="p-4 pt-2 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent sticky bottom-0 z-40 bg-stone-50/90 backdrop-blur-sm">
                 <ChatInput conversationId={conversationId} />
            </div>
        </div>
    );
}
