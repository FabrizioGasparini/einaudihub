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
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                    {state.error}
                </div>
            )}

            {/* Hidden JSON input for options array */}
            <input type="hidden" name="options" value={JSON.stringify(options.filter(o => o.trim() !== ""))} />

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Domanda del Sondaggio</label>
                <input 
                    name="question" 
                    type="text" 
                    required 
                    minLength={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Es. Dove andiamo in gita?"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Opzioni ({options.length}/5)</label>
                <div className="space-y-3">
                    {options.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                             <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => updateOption(i, e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={`Opzione ${i + 1}`}
                            />
                            {options.length > 2 && (
                                <button type="button" onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500 p-2">
                                    <X />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {options.length < 5 && (
                    <button type="button" onClick={addOption} className="mt-3 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                        <Plus size={16} /> Aggiungi Opzione
                    </button>
                )}
            </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Scadenza (Opzionale)</label>
                <input 
                    name="endsAt" 
                    type="datetime-local" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Visibilità</label>
                <div className="grid grid-cols-2 gap-4">
                    {canCreateGlobal && (
                        <label className="cursor-pointer">
                            <input type="radio" name="scope" value="SCHOOL" className="peer sr-only" defaultChecked={canCreateGlobal && !canCreateClass} />
                            <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-purple-100 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all flex flex-col items-center gap-2 text-center">
                                <Globe className="text-purple-500 mb-1" />
                                <span className="font-bold text-gray-900">Tutta la Scuola</span>
                                <span className="text-xs text-gray-500">Sondaggio Ufficiale</span>
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
                    <>
                        <Vote size={20} />
                        Crea Sondaggio
                    </>
                )}
            </button>
        </form>
    );
}