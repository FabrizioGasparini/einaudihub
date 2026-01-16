'use client';

import { createAnnouncement } from "@/app/announcement-actions";
import { useActionState, useEffect } from "react";
import { Loader2, Megaphone, Users, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

const initialState: any = {
  error: "",
  success: false
};

interface CreateAnnouncementFormProps {
    canCreateSchool: boolean;
    canCreateClass: boolean;
    onSuccess?: () => void;
}

export default function CreateAnnouncementForm({ canCreateSchool, canCreateClass, onSuccess }: CreateAnnouncementFormProps) {
    const [state, formAction, isPending] = useActionState(createAnnouncement, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.refresh();
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/announcements");
            }
        }
    }, [state.success, router, onSuccess]);

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titolo Avviso</label>
                <input 
                    name="title" 
                    type="text" 
                    required 
                    minLength={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Es. Sciopero mezzi pubblici"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contenuto</label>
                <textarea 
                    name="content" 
                    required 
                    minLength={10}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Scrivi qui il contenuto dell'avviso..."
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Destinatari</label>
                <div className="grid grid-cols-2 gap-4">
                    {canCreateSchool && (
                        <label className="cursor-pointer">
                            <input type="radio" name="scope" value="SCHOOL" className="peer sr-only" defaultChecked={canCreateSchool && !canCreateClass} />
                            <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-red-100 peer-checked:border-red-500 peer-checked:bg-red-50 transition-all flex flex-col items-center gap-2 text-center">
                                <Globe className="text-red-500 mb-1" />
                                <span className="font-bold text-gray-900">Tutto l'Istituto</span>
                                <span className="text-xs text-gray-500">Avviso Ufficiale</span>
                            </div>
                        </label>
                    )}
                    
                    {canCreateClass && (
                        <label className="cursor-pointer">
                            <input type="radio" name="scope" value="CLASS" className="peer sr-only" defaultChecked={!canCreateSchool} />
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
                        Pubblicazione...
                    </>
                ) : (
                    <>
                        <Megaphone size={20} />
                        Pubblica Avviso
                    </>
                )}
            </button>
        </form>
    );
}