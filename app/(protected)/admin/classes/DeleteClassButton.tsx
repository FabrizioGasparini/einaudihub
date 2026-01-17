'use client';

import { deleteClass } from "@/app/admin-actions";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

export default function DeleteClassButton({ classId, hasStudents }: { classId: string, hasStudents: boolean }) {
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [alertState, setAlertState] = useState<{isOpen: boolean, title: string, message: string, type: "error" | "info" | "success"}>({ 
        isOpen: false, title: "", message: "", type: "error" 
    });
    const router = useRouter();

    const handleDeleteClick = () => {
        if (hasStudents) {
            setAlertState({ 
                isOpen: true, 
                title: "Azione non consentita", 
                message: "Non puoi eliminare una classe con studenti iscritti. Sposta prima gli studenti in un'altra classe.",
                type: "error"
            });
            return;
        }
        setConfirmOpen(true);
    };

    const performDelete = async () => {
        setConfirmOpen(false);
        setLoading(true);
        const res = await deleteClass(classId);
        if (!res.success) {
            setAlertState({
                isOpen: true,
                title: "Errore",
                message: res.error || "Errore durante l'eliminazione",
                type: "error"
            });
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <>
            <ConfirmModal 
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={performDelete}
                title="Elimina classe"
                message="Sei sicuro di voler eliminare questa classe? L'operazione è irreversibile."
                isDestructive
            />
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState({ ...alertState, isOpen: false })}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
            <button 
                onClick={handleDeleteClick}
                disabled={loading || hasStudents}
                title={hasStudents ? "Classe non vuota" : "Elimina"}
                className={`p-2 rounded-lg transition-colors ${
                    hasStudents 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={16} />}
            </button>
        </>
    );
}
