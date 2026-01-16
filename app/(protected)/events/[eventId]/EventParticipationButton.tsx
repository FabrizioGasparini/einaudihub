'use client';

import { useTransition } from 'react';
import { joinEvent } from '@/app/event-actions';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EventParticipationButtonProps {
    eventId: string;
    isParticipating: boolean;
}

export default function EventParticipationButton({ eventId, isParticipating }: EventParticipationButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleClick = () => {
        startTransition(async () => {
            await joinEvent(eventId, !isParticipating);
            router.refresh();
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`
                flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95
                ${isParticipating 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 border-2 border-red-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 bg-gradient-to-r from-blue-600 to-indigo-600'}
                ${isPending ? 'opacity-70 cursor-wait' : ''}
            `}
        >
            {isParticipating ? (
                <>
                    <X size={20} />
                    <span>Annulla adesione</span>
                </>
            ) : (
                <>
                    <Check size={20} />
                    <span>Parteciperò</span>
                </>
            )}
        </button>
    );
}