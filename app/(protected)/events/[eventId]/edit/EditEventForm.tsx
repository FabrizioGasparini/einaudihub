'use client';

import { updateEvent } from "@/app/event-actions";
import { useActionState, useEffect } from "react";
import { Loader2, Save, Calendar, MapPin, AlignLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

interface EventData {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: string | null;
}

const initialState: any = {
  error: "",
  success: false
};

export default function EditEventForm({ event }: { event: EventData }) {
    const [state, formAction, isPending] = useActionState(updateEvent, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push(`/events/${event.id}`);
            router.refresh();
        }
    }, [state.success, router, event.id]);

    const formattedDate = new Date(event.date.getTime() - event.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="eventId" value={event.id} />
             {state.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titolo</label>
                <input 
                    name="title" 
                    type="text" 
                    required 
                    minLength={3}
                    defaultValue={event.title}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Es. Partita di Calcio"
                />
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Descrizione</label>
                 <textarea 
                    name="description" 
                    required 
                    minLength={10}
                    defaultValue={event.description}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Descrivi l'evento..."
                 />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data e Ora</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            name="date" 
                            type="datetime-local" 
                            required
                            defaultValue={formattedDate}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Luogo (Opzionale)</label>
                    <div className="relative">
                         <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                            name="location" 
                            type="text" 
                            defaultValue={event.location || ""}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Es. Palestra"
                         />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Link 
                    href={`/events/${event.id}`}
                    className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all text-center"
                >
                    Annulla
                </Link>
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Salva
                </button>
            </div>
        </form>
    );
}
