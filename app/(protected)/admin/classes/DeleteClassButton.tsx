'use client';

import { deleteClass } from "@/app/admin-actions";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteClassButton({ classId, hasStudents }: { classId: string, hasStudents: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (hasStudents) {
            alert("Non puoi eliminare una classe con studenti iscritti. Cambia prima la loro classe.");
            return;
        }
        if (!confirm("Sei sicuro di voler eliminare questa classe?")) return;

        setLoading(true);
        const res = await deleteClass(classId);
        if (!res.success) {
            alert(res.error || "Errore durante l'eliminazione");
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <button 
            onClick={handleDelete}
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
    );
}
