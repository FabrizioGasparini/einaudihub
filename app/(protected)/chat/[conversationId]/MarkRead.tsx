"use client";

import { useEffect } from "react";
import { markConversationAsRead } from "../actions";

export default function MarkRead({ conversationId }: { conversationId: string }) {
    useEffect(() => {
        markConversationAsRead(conversationId);
    }, [conversationId]);
    return null;
}
