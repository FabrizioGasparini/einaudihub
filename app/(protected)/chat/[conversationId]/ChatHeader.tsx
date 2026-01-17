"use client";

import { ArrowLeft, MoreVertical, ShieldCheck, BadgeCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteConversation } from "../actions";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

interface ChatHeaderProps {
    otherParticipant: any;
    conversationId: string;
}

export default function ChatHeader({ otherParticipant, conversationId }: ChatHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [isAlertOpen, setAlertOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const isSchoolRep = otherParticipant?.roles?.some((r: any) => r.role === "SCHOOL_REP");
    const isClassRep = otherParticipant?.roles?.some((r: any) => r.role === "CLASS_REP");
    const isRep = isSchoolRep || isClassRep;

    const handleDelete = async () => {
        setIsLoading(true);
        const res = await deleteConversation(conversationId);
        setIsLoading(false);
        setConfirmOpen(false);

        if (res.success) {
            router.push("/chat");
        } else {
            setAlertOpen(true);
        }
    };

    return (
        <>
            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Elimina conversazione"
                message="Sei sicuro di voler eliminare questa conversazione? Questa azione non può essere annullata."
                isDestructive
                isLoading={isLoading}
            />
            <AlertModal
                isOpen={isAlertOpen}
                onClose={() => setAlertOpen(false)}
                title="Errore"
                message="Si è verificato un errore durante l'eliminazione della conversazione."
                type="error"
            />
            
            <div className="absolute top-4 left-4 right-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/chat" className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-white
                            ${isSchoolRep ? 'bg-gradient-to-tr from-amber-400 to-orange-500' : 'bg-gradient-to-tr from-indigo-500 to-purple-600'}`}>
                            {otherParticipant?.avatarUrl ? (
                                <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                otherParticipant?.name?.[0]
                            )}
                        </div>
                        {isRep && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                <BadgeCheck size={14} className={isSchoolRep ? "text-amber-500 fill-amber-50" : "text-indigo-500 fill-indigo-50"} />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="font-bold text-gray-900 leading-none text-sm md:text-base">
                                {otherParticipant?.name}
                            </h1>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-0.5">
                            {isSchoolRep && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                                    Rappresentante d'Istituto
                                </span>
                            )}
                            {isClassRep && !isSchoolRep && (
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-200">
                                    Rappresentante di Classe
                                </span>
                            )}
                            {!isRep && (
                                <span className="text-xs text-gray-500 font-medium">Studente</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-1">
                                    <button 
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setConfirmOpen(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors text-left"
                                    >
                                        <Trash2 size={16} />
                                        Elimina chat
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
