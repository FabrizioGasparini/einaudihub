"use client";

import { startNewChat } from "./actions";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

interface StartChatButtonProps {
    targetUser: { id: string, name: string, avatarUrl?: string | null };
    children?: React.ReactNode;
    className?: string;
    title?: string;
}

export default function StartChatButton({ targetUser, children, className, title }: StartChatButtonProps) {
    const router = useRouter();

    const handleClick = async () => {
        const res = await startNewChat(targetUser.id);
        if (res.conversationId) {
            router.push(`/chat/${res.conversationId}`);
        }
    };

    if (children) {
        return (
            <button onClick={handleClick} className={className} title={title}>
                {children}
            </button>
        );
    }

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
