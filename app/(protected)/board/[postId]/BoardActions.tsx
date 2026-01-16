'use client';

import { deletePost } from "@/app/board-actions";
import { reportPost } from "../actions";
import { useState, useTransition } from "react";
import { Loader2, Pencil, Trash2, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal"; 
import AlertModal from "@/components/ui/AlertModal";

export default function BoardActions({ 
    postId, 
    isOwner, 
    hasAdminPower,
    canDelete
}: { 
    postId: string, 
    isOwner: boolean, 
    hasAdminPower: boolean,
    canDelete?: boolean
}) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    
    const [alertState, setAlertState] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({
        isOpen: false, title: "", message: "", type: 'info'
    });

    // Enforce strict ownership for deletion visibility as requested
    const showDelete = isOwner; 

    const confirmDelete = () => {
        startTransition(async () => {
            const res = await deletePost(postId);
            if (res?.error) {
                setAlertState({isOpen: true, title: "Errore", message: res.error, type: 'error'});
            } else {
                router.push("/board");
                router.refresh();
            }
        });
    };

    const confirmReport = () => {
        startTransition(async () => {
            const res = await reportPost(postId);
            if (res?.error) {
                setAlertState({isOpen: true, title: "Errore", message: res.error, type: 'error'});
            } else {
                setShowReportModal(false);
                setAlertState({isOpen: true, title: "Segnalazione Inviata", message: "Segnalazione inviata con successo.", type: 'success'});
            }
        });
    };

    if (showDelete) {
        return (
            <>
            <div className="flex gap-2">
                {isOwner && (
                    <Link 
                        href={`/board/${postId}/edit`} 
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                        title="Modifica"
                    >
                        <Pencil size={18} />
                    </Link>
                )}
                <button 
                    onClick={() => setShowDeleteModal(true)} 
                    disabled={isPending}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors disabled:opacity-50"
                    title="Elimina"
                >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
            </div>
            
            <ConfirmModal 
               isOpen={showDeleteModal}
               onClose={() => setShowDeleteModal(false)}
               onConfirm={confirmDelete}
               title="Eliminazione Post"
               message="Sei sicuro di voler eliminare questo post? Sarà rimosso permanentemente."
               isDestructive={true}
               isLoading={isPending}
            />
            
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
            </>
        );
    }

    return (
        <>
        <button 
            onClick={() => setShowReportModal(true)}
            disabled={isPending}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Segnala"
        >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Flag size={18} />}
        </button>

         <ConfirmModal 
               isOpen={showReportModal}
               onClose={() => setShowReportModal(false)}
               onConfirm={confirmReport}
               title="Segnala Contenuto"
               message="Vuoi segnalare questo contenuto agli amministratori?"
               isLoading={isPending}
            />
            
         <AlertModal
            isOpen={alertState.isOpen}
            onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
            title={alertState.title}
            message={alertState.message}
            type={alertState.type}
        />
        </>
    );
}
