"use client";

import { startConversation } from "./actions";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function StartChatButton({ targetUser }: { targetUser: { id: string, name: string } }) {
    const router = useRouter();

    const handleClick = async () => {
        const res = await startConversation(targetUser.id);
        if (res.conversationId) {
            router.push(`/chat/${res.conversationId}`);
        } else if (res.error) {
            alert(res.error);
        }
    };

    return (
        <button 
            onClick={handleClick}
            className="flex flex-col items-center min-w-[80px]"
        >
            <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-orange-400 p-[2px] rounded-full mb-1">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <User size={24} className="text-gray-700" />
                </div>
            </div>
            <span className="text-xs text-center font-medium truncate w-full">{targetUser.name.split(' ')[0]}</span>
        </button>
    );
}
