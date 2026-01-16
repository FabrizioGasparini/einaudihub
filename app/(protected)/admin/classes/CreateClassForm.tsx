'use client';

import { createClass } from "@/app/admin-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreateClassForm({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', content: '' });

        const formData = new FormData(e.currentTarget);
        const year = parseInt(formData.get("year") as string);
        const section = (formData.get("section") as string).toUpperCase().trim();

        if (!year || !section) {
            setMsg({ type: 'error', content: "Compila tutti i campi" });
            setLoading(false);
            return;
        }

        const res = await createClass(year, section);
        if (res.success) {
            setMsg({ type: 'success', content: "Classe creata!" });
            (e.target as HTMLFormElement).reset();
            router.refresh();
            if (onSuccess) onSuccess();
        } else {
            setMsg({ type: 'error', content: res.error || "Errore" });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Anno</label>
                    <select name="year" className="w-full p-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                        {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Sezione</label>
                    <input 
                        name="section" 
                        type="text" 
                        placeholder="es. A" 
                        maxLength={5}
                        className="w-full p-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    />
                </div>
            </div>

            {msg.content && (
                <div className={`text-xs p-2 rounded ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {msg.content}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Crea Classe"}
            </button>
        </form>
    );
}
