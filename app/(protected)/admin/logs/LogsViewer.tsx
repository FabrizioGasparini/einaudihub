"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, Filter, Calendar, User, ChevronLeft, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { getAuditLogs, getLogActions } from "./actions";

export default function LogsViewer() {
    const [logs, setLogs] = useState<any[]>([]);
    const [actions, setActions] = useState<string[]>([]);
    const [loading, startTransition] = useTransition();
    
    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedAction, setSelectedAction] = useState("ALL");
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const fetchData = () => {
        startTransition(async () => {
            const data = await getAuditLogs({ page, search, action: selectedAction });
            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setTotalLogs(data.totalLogs);
        });
    };

    // Load actions on mount
    useEffect(() => {
        getLogActions().then(setActions);
    }, []);

    // Fetch logs when params change
    useEffect(() => {
        fetchData();
    }, [page, selectedAction]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cerca per utente, azione o dettagli..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                        <Filter size={16} className="text-gray-500" />
                        <select 
                            value={selectedAction} 
                            onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 min-w-[120px]"
                        >
                            <option value="ALL">Tutte le azioni</option>
                            {actions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white border boundary-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Azione</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Utente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dettagli</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data & IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-indigo-500">
                                            <Loader2 size={32} className="animate-spin" />
                                            <span className="text-sm font-medium text-gray-400">Caricamento logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        <ShieldAlert size={32} className="mx-auto mb-2 opacity-50" />
                                        Nessun log trovato
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
                                                        {log.user.avatarUrl ? (
                                                            <img src={log.user.avatarUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                            log.user.name[0]
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-900">{log.user.name}</div>
                                                        <div className="text-xs text-gray-500">{log.user.email}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Sistema / Utente eliminato</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-100 max-w-xs break-all text-gray-600">
                                                {log.details ? JSON.stringify(JSON.parse(JSON.stringify(log.details))).slice(0, 100) : '-'}
                                                {log.details && log.details.length > 100 && '...'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-700">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                            {log.ipAddress && (
                                                <div className="text-xs text-gray-400 mt-1 font-mono">
                                                    IP: {log.ipAddress}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Totale: <strong>{totalLogs}</strong> eventi
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                        >
                            <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <span className="text-sm font-bold text-gray-700 w-8 text-center">{page}</span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                            className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                        >
                            <ChevronRight size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
