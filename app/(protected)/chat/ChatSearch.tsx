"use client";

import { useState, useTransition } from "react";
import { Search, User as UserIcon, Loader2, Send } from "lucide-react";
import { searchUsersToChat, startNewChat } from "./actions";
import { useRouter } from "next/navigation";

export default function ChatSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, startSearchTransition] = useTransition();
    const [isStarting, startChatTransition] = useTransition();
    const router = useRouter();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        
        if (val.length < 2) {
            setResults([]);
            return;
        }

        startSearchTransition(async () => {
            const users = await searchUsersToChat(val);
            setResults(users);
        });
    };

    const handleStartChat = (userId: string) => {
        startChatTransition(async () => {
            const res = await startNewChat(userId);
            if (res.conversationId) {
                router.push(`/chat/${res.conversationId}`);
            }
        });
    };

    return (
        <div className="relative mb-8 group z-50">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur pointer-events-none"></div>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors z-10 pointer-events-none" size={20} />
            <input 
                type="text" 
                value={query}
                onChange={handleSearch}
                placeholder="Cerca studenti..." 
                className="w-full relative z-10 bg-white border border-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 pl-12 pr-4 transition-all text-sm font-medium shadow-sm outline-none text-gray-900 placeholder:text-gray-400"
            />

            {/* Loading Indicator */}
            {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-indigo-500" size={20} />
                </div>
            )}

            {/* Results Dropdown */}
            {results.length > 0 && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2">
                        <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">Risultati ricerca</p>
                        {results.map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleStartChat(user.id)}
                                disabled={isStarting}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden flex-shrink-0">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name[0]
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.roles.some((r: any) => r.role === 'ADMIN') ? 'Admin' : 
                                         user.roles.some((r: any) => r.role === 'CLASS_REP') ? 'Rappresentante' :
                                         user.class ? `${user.class.year}${user.class.section}` : 'Studente'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                                    {isStarting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}