'use client';

import { createEvent } from "@/app/event-actions";
import { useActionState } from "react";
import { Loader2, Calendar, MapPin, Globe, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const initialState: any = {
  error: "",
  success: false
};

interface CreateEventFormProps {
    canCreateGlobal: boolean;
    canCreateClass: boolean;
}

export default function CreateEventForm({ canCreateGlobal, canCreateClass }: CreateEventFormProps) {
    const [state, formAction, isPending] = useActionState(createEvent, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push("/events");
        }
    }, [state.success, router]);

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titolo dell'evento</label>
                <input 
                    name="title" 
                    type="text" 
                    required 
                    minLength={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Es. Assemblea di Istituto"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descrizione</label>
                <textarea 
                    name="description" 
                    required 
                    minLength={10}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Descrivi i dettagli dell'evento..."
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500"/>
                            Data e Ora
                        </div>
                    </label>
                    <input 
                        name="date" 
                        type="datetime-local" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-500"/>
                            Luogo (Opzionale)
                        </div>
                    </label>
                    <input 
                        name="location" 
                        type="text" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Es. Aula Magna"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Visibilità</label>
                <div className="grid grid-cols-2 gap-4">
                    {canCreateGlobal && (
                        <label className="cursor-pointer">
                            <input type="radio" name="scope" value="GLOBAL" className="peer sr-only" defaultChecked={canCreateGlobal && !canCreateClass} />
                            <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-blue-100 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all flex flex-col items-center gap-2 text-center">
                                <Globe className="text-blue-500 mb-1" />
                                <span className="font-bold text-gray-900">Tutta la Scuola</span>
                                <span className="text-xs text-gray-500">Visibile a tutti gli studenti</span>
                            </div>
                        </label>
                    )}
                    
                    {canCreateClass && (
                        <label className="cursor-pointer">
                            <input type="radio" name="scope" value="CLASS" className="peer sr-only" defaultChecked={!canCreateGlobal} />
                            <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-green-100 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all flex flex-col items-center gap-2 text-center">
                                <Users className="text-green-500 mb-1" />
                                <span className="font-bold text-gray-900">La mia Classe</span>
                                <span className="text-xs text-gray-500">Visibile solo ai compagni</span>
                            </div>
                        </label>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Creazione in corso...
                    </>
                ) : (
                    "Crea Evento"
                )}
            </button>
        </form>
    );
}