"use client";

import { useState } from "react";
import { Plus, Search, Eye, Hash } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import CreateClassForm from "./CreateClassForm";
import DeleteClassButton from "./DeleteClassButton";

type ClassData = {
    id: string;
    year: number;
    section: string;
    _count: { students: number };
};

export default function AdminClassesManager({ classes }: { classes: ClassData[] }) {
    const [filter, setFilter] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const filtered = classes.filter(c => 
        (c.year.toString() + c.section).toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Cerca classe..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    <span>Nuova Classe</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Classe</th>
                            <th className="px-6 py-3 text-center">Studenti</th>
                            <th className="px-6 py-3 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length > 0 ? (
                            filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {c.year}{c.section}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {c._count.students > 0 ? (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {c._count.students}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-gray-400">
                                            <Link 
                                                href={`/my-class?adminViewClassId=${c.id}`}
                                                className="p-2 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                                                title="Dashboard Classe"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <Link 
                                                href={`/board?tab=class&adminViewClassId=${c.id}`}
                                                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                title="Bacheca Classe"
                                            >
                                                <Hash size={18} />
                                            </Link>
                                            <DeleteClassButton classId={c.id} hasStudents={c._count.students > 0} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                                    Nessuna classe trovata.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                title="Nuova Classe"
            >
                <CreateClassForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>
        </div>
    );
}
