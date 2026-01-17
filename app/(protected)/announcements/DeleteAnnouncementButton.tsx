'use client';

import { useTransition, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteAnnouncement } from '@/app/announcement-actions';
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function DeleteAnnouncementButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDeleteClick = () => setConfirmOpen(true);

    const performDelete = () => {
        setConfirmOpen(false);
        startTransition(() => {
             deleteAnnouncement(id);
        });
    };

    return (
        <>
        <ConfirmModal 
            isOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={performDelete}
            title="Elimina avviso"
            message="Sei sicuro di voler eliminare questo avviso?"
            isDestructive
        />
        <button 
            onClick={handleDeleteClick} 
            disabled={isPending}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Elimina avviso"
        >
            <Trash2 size={16} />
        </button>
        </>
    );
}