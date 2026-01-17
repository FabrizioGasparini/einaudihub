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
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full bg-red-500"></span>
                    {state.error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Titolo dell'evento</label>
                <input 
                    name="title" 
                    type="text" 
                    required 
                    minLength={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-gray-900 font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Es. Assemblea di Istituto"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Descrizione</label>
                <textarea 
                    name="description" 
                    required 
                    minLength={10}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-gray-400"
                    placeholder="Descrivi i dettagli dell'evento..."
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                        <Calendar size={12} />
                        Data e Ora
                    </label>
                    <input 
                        name="date" 
                        type="datetime-local" 
                        required 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                        <MapPin size={12} />
                        Luogo <span className="text-gray-300 font-normal normal-case ml-1">(opzionale)</span>
                    </label>
                    <input 
                        name="location" 
                        type="text" 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="Es. Aula Magna"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Visibilità</label>
                <div className="grid grid-cols-2 gap-3">
                    {canCreateGlobal && (
                        <label className="relative flex cursor-pointer rounded-xl border-2 border-transparent bg-gray-50 p-4 shadow-sm focus:outline-none transition-all hover:bg-blue-50/50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
                            <input type="radio" name="scope" value="GLOBAL" className="sr-only" defaultChecked={canCreateGlobal && !canCreateClass} />
                            <div className="flex flex-col items-center gap-2 text-center w-full">
                                <span className="p-2 bg-white rounded-full shadow-sm text-blue-500">
                                    <Globe size={20} />
                                </span>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Tutta la Scuola</span>
                                    <span className="block text-xs text-gray-500">Tutti gli studenti</span>
                                </div>
                            </div>
                        </label>
                    )}
                    
                    {canCreateClass && (
                        <label className="relative flex cursor-pointer rounded-xl border-2 border-transparent bg-gray-50 p-4 shadow-sm focus:outline-none transition-all hover:bg-green-50/50 has-[:checked]:bg-green-50 has-[:checked]:border-green-500 has-[:checked]:ring-1 has-[:checked]:ring-green-500">
                            <input type="radio" name="scope" value="CLASS" className="sr-only" defaultChecked={!canCreateGlobal} />
                            <div className="flex flex-col items-center gap-2 text-center w-full">
                                <span className="p-2 bg-white rounded-full shadow-sm text-green-500">
                                    <Users size={20} />
                                </span>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">La mia Classe</span>
                                    <span className="block text-xs text-gray-500">Solo compagni</span>
                                </div>
                            </div>
                        </label>
                    )}
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-[1.02] disabled:opacity-70 disabled:pointer-events-none py-4 font-bold text-sm tracking-wide"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <div className="flex items-center justify-center gap-2 relative z-10">
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creazione in corso...
                            </>
                        ) : (
                            "Crea Evento"
                        )}
                    </div>
                </button>
            </div>
        </form>
    );
}