'use client';

import { createPoll } from "@/app/poll-actions";
import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus, X, Globe, Users, Vote } from "lucide-react";
import { useRouter } from "next/navigation";

const initialState: any = {
  error: "",
  success: false
};

interface CreatePollFormProps {
    canCreateGlobal: boolean;
    canCreateClass: boolean;
}

export default function CreatePollForm({ canCreateGlobal, canCreateClass }: CreatePollFormProps) {
    const [state, formAction, isPending] = useActionState(createPoll, initialState);
    const [options, setOptions] = useState(["", ""]);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push("/polls");
        }
    }, [state.success, router]);

    const addOption = () => {
        if (options.length < 5) setOptions([...options, ""]);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOpts = [...options];
            newOpts.splice(index, 1);
            setOptions(newOpts);
        }
    };

    const updateOption = (index: number, val: string) => {
        const newOpts = [...options];
        newOpts[index] = val;
        setOptions(newOpts);
    };

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full bg-red-500"></span>
                    {state.error}
                </div>
            )}

            {/* Hidden JSON input for options array */}
            <input type="hidden" name="options" value={JSON.stringify(options.filter(o => o.trim() !== ""))} />

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Domanda del Sondaggio</label>
                <input 
                    name="question" 
                    type="text" 
                    required 
                    minLength={5}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-gray-900 font-bold text-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Es. Dove andiamo in gita?"
                />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-end px-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opzioni</label>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{options.length}/5</span>
                </div>
                <div className="space-y-3">
                    {options.map((opt, i) => (
                        <div key={i} className="flex gap-2 group">
                             <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => updateOption(i, e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder={`Opzione ${i + 1}`}
                            />
                            {options.length > 2 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeOption(i)} 
                                    className="px-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Rimuovi opzione"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {options.length < 5 && (
                    <button 
                        type="button" 
                        onClick={addOption} 
                        className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Aggiungi un'altra opzione
                    </button>
                )}
            </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Scadenza</label>
                <input 
                    name="endsAt" 
                    type="datetime-local" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Visibilità</label>
                <div className="grid grid-cols-2 gap-3">
                    {canCreateGlobal && (
                        <label className="relative flex cursor-pointer rounded-xl border-2 border-transparent bg-gray-50 p-4 shadow-sm focus:outline-none transition-all hover:bg-purple-50/50 has-[:checked]:bg-purple-50 has-[:checked]:border-purple-500 has-[:checked]:ring-1 has-[:checked]:ring-purple-500">
                            <input type="radio" name="scope" value="SCHOOL" className="sr-only" defaultChecked={canCreateGlobal && !canCreateClass} />
                            <div className="flex flex-col items-center gap-2 text-center w-full">
                                <span className="p-2 bg-white rounded-full shadow-sm text-purple-500">
                                    <Globe size={20} />
                                </span>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Tutta la Scuola</span>
                                    <span className="block text-xs text-gray-500">Sondaggio Ufficiale</span>
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
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-[1.02] disabled:opacity-70 disabled:pointer-events-none py-4 font-bold text-sm tracking-wide"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <div className="flex items-center justify-center gap-2 relative z-10">
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creazione in corso...
                            </>
                        ) : (
                            <>
                                <Vote size={18} />
                                Crea Sondaggio
                            </>
                        )}
                    </div>
                </button>
            </div>
        </form>
    );
}