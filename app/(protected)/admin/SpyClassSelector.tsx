"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, MessageSquare } from 'lucide-react';

type ClassOption = {
    id: string;
    year: number;
    section: string;
};

export default function SpyClassSelector({ classes }: { classes: ClassOption[] }) {
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const router = useRouter();

    const handleSpyDashboard = () => {
        if (!selectedClassId) return;
        router.push(`/my-class?adminViewClassId=${selectedClassId}`);
    };

    const handleSpyBoard = () => {
        if (!selectedClassId) return;
        router.push(`/board?tab=class&adminViewClassId=${selectedClassId}`);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border mt-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Accesso Rapido Classi</h3>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <select 
                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="">Seleziona una classe...</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.year}{c.section}
                            </option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={handleSpyDashboard}
                    disabled={!selectedClassId}
                    className="h-12 px-6 bg-amber-100 text-amber-800 rounded-lg font-bold hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                >
                    <Eye size={20} />
                    <span>Dashboard</span>
                </button>
                <button 
                    onClick={handleSpyBoard}
                    disabled={!selectedClassId}
                    className="h-12 px-6 bg-blue-100 text-blue-800 rounded-lg font-bold hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                >
                    <MessageSquare size={20} />
                    <span>Bacheca</span>
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Permette di visualizzare dashboard e bacheca di una specifica classe con privilegi amministrativi.
            </p>
        </div>
    );
}
