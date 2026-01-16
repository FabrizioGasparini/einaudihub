'use client';

import { votePoll, deletePoll } from "@/app/poll-actions";
import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Clock, Lock, Pencil, Trash2, Globe, School } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UserRoleBadge from "@/components/UserRoleBadge";

interface PollOption {
    id: string;
    text: string;
    _count: { votes: number };
}

interface CreatorInfo {
    name: string;
    roles: { role: string }[];
}

interface PollProps {
    id: string;
    question: string;
    options: PollOption[];
    endsAt: Date | null;
    userVotedOptionId?: string | null;
    totalVotes: number;
    canVote: boolean;
    canManage?: boolean;
    creator: CreatorInfo;
    schoolWide: boolean;
    forceShowResults?: boolean;
}

export default function PollCard({ 
    id, 
    question, 
    options, 
    endsAt, 
    userVotedOptionId, 
    totalVotes, 
    canVote, 
    canManage,
    creator,
    schoolWide,
    forceShowResults = false
}: PollProps) {
    const [isPending, startTransition] = useTransition();
    const [optimisticVotedId, setOptimisticVotedId] = useState<string | null>(userVotedOptionId || null);
    const router = useRouter();

    const isExpired = endsAt ? new Date() > new Date(endsAt) : false;
    const isLocked = !!optimisticVotedId || isExpired || !canVote;
    const showResults = isLocked || forceShowResults;

    const handleVote = (optionId: string) => {
        if (isLocked || isPending) return;
        
        setOptimisticVotedId(optionId); // UI Optimistic update (fake)

        startTransition(async () => {
            const result = await votePoll(id, optionId);
            if (result.error) {
                alert(result.error);
                setOptimisticVotedId(null); // Revert
            } else {
                router.refresh();
            }
        });
    };
    
    const handleDelete = () => {
        if (!confirm("Sei sicuro di voler eliminare questo sondaggio?")) return;
        startTransition(async () => {
             const res = await deletePoll(id);
             if (res.error) alert(res.error);
        });
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative group mb-2">
            
            {/* Header with Creator & Badges */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${schoolWide ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {creator.name.charAt(0)}
                     </div>
                     <div>
                         <div className="flex items-center gap-1.5">
                             <span className="font-bold text-sm text-gray-900">{creator.name}</span>
                             {schoolWide ? (
                                 <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                     <Globe size={10} /> Istituto
                                 </span>
                             ) : (
                                 <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                     <School size={10} /> Classe
                                 </span>
                             )}
                         </div>
                         <div className="flex items-center gap-1">
                            {creator.roles.length > 0 && <UserRoleBadge role={creator.roles[0].role as any} className="scale-75 origin-left" />}
                         </div>
                     </div>
                </div>

                {canManage && (
                    <div className="flex gap-1">
                        <Link 
                            href={`/polls/${id}/edit`} 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Modifica"
                        >
                            <Pencil size={16} />
                        </Link>
                        <button 
                            onClick={handleDelete} 
                            disabled={isPending}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Elimina"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-6">{question}</h3>

            <div className="space-y-3">
                {options.map((opt) => {
                    const percentage = totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0;
                    const isSelected = optimisticVotedId === opt.id;
                    const isWinner = false; // Logic for winner could be added here

                    return (
                        <div key={opt.id} className="relative">
                            {showResults ? (
                                // RESULT BAR
                                <div 
                                    onClick={() => !isLocked && handleVote(opt.id)}
                                    className={`relative h-12 rounded-xl overflow-hidden bg-gray-50 border transition-all ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'} ${!isLocked ? 'cursor-pointer hover:border-blue-400 hover:shadow-sm group/bar' : ''}`}
                                >
                                    <div 
                                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${isSelected ? 'bg-blue-100' : 'bg-gray-200'} ${!isLocked ? 'group-hover/bar:bg-blue-100/50' : ''}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                                        <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'} flex items-center gap-2`}>
                                            {opt.text} 
                                            {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                                            {!isLocked && !isSelected && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">Vota</span>}
                                        </span>
                                        <span className="font-bold text-gray-900">{percentage}%</span>
                                    </div>
                                </div>
                            ) : (
                                // VOTE BUTTON
                                <button
                                    onClick={() => handleVote(opt.id)}
                                    disabled={isPending}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-gray-700 active:scale-[0.99] flex justify-between items-center group"
                                >
                                    <span>{opt.text}</span>
                                    {isPending && <Loader2 size={16} className="animate-spin opacity-0 group-hover:opacity-100" />}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between mt-6 text-xs text-gray-500 font-medium uppercase tracking-wider">
                <span>{totalVotes} Voti</span>
                
                <div className="flex items-center gap-2">
                    {isExpired ? (
                        <span className="text-red-500 flex items-center gap-1">
                            <Lock size={14} /> Chiuso
                        </span>
                    ) : endsAt ? (
                        <span className="text-orange-500 flex items-center gap-1">
                            <Clock size={14} /> Scade il {new Date(endsAt).toLocaleDateString()}
                        </span>
                    ) : (
                        <span className="text-green-600">Attivo</span>
                    )}
                </div>
            </div>
        </div>
    );
}