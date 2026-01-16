'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteAnnouncement } from '@/app/announcement-actions';

export default function DeleteAnnouncementButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Sei sicuro di voler eliminare questo avviso?")) return;
        startTransition(() => {
             deleteAnnouncement(id);
        });
    };

    return (
        <button 
            onClick={handleDelete} 
            disabled={isPending}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Elimina avviso"
        >
            <Trash2 size={16} />
        </button>
    );
}