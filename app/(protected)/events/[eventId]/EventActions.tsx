'use client';

import { deleteEvent } from "@/app/event-actions";
import { useState, useTransition } from "react";
import { Loader2, Pencil, Trash2, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EventActions({ eventId }: { eventId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm("Sei sicuro di voler eliminare questo evento?")) return;
        startTransition(async () => {
            const res = await deleteEvent(eventId);
            if (res.error) {
                alert(res.error);
            } else {
                router.push("/events");
                router.refresh();
            }
        });
    };

    return (
        <div className="flex gap-2">
            <Link 
                href={`/events/${eventId}/edit`} 
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-lg transition-colors border border-white/20"
                title="Modifica"
            >
                <Pencil size={18} />
            </Link>
            <button 
                onClick={handleDelete} 
                disabled={isPending}
                className="bg-white/20 backdrop-blur-md hover:bg-red-500/80 text-white p-2 rounded-lg transition-colors border border-white/20 disabled:opacity-50"
                title="Elimina"
            >
                {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
        </div>
    );
}
