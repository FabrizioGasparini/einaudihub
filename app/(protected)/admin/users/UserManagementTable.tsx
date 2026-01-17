'use client';

import { useState, useTransition, useMemo } from "react";
import { toggleUserRole, deleteUser } from "@/app/admin-actions";
import { RoleName } from "@prisma/client";
import { Trash2, Search, Filter, User, Shield, GraduationCap, Crown, AlertOctagon } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface UserData {
    id: string;
    name: string;
    email: string;
    roles: { role: RoleName }[];
    classId: string | null;
    class: { year: number; section: string } | null;
}

const TOGGLEABLE_ROLES: RoleName[] = ["CLASS_REP", "SCHOOL_REP", "MODERATOR", "ADMIN"];

export default function UserManagementTable({ users }: { users: UserData[] }) {
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleName | 'ALL'>('ALL');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    
    // Filter users logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.class && `${user.class.year}${user.class.section}`.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesRole = roleFilter === 'ALL' 
                ? true 
                : user.roles.some(r => r.role === roleFilter);

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);
    
    // Optimistic / Simple toggle handler
    const handleToggleRole = (userId: string, role: RoleName) => {
        startTransition(async () => {
             await toggleUserRole(userId, role);
        });
    };
    const confirmDeleteAction = () => {
        if (!deleteConfirmId) return;
        startTransition(async () => {
             await deleteUser(deleteConfirmId);
             setDeleteConfirmId(null);
        });
    };

    const getRoleIcon = (role: RoleName) => {
        switch(role) {
            case 'ADMIN': return <Crown size={12} />;
            case 'MODERATOR': return <Shield size={12} />;
            case 'SCHOOL_REP': return <GraduationCap size={12} />;
            case 'CLASS_REP': return <User size={12} />;
            default: return null;
        }
    }

    return (
        <>
        <ConfirmModal 
            isOpen={!!deleteConfirmId}
            onClose={() => setDeleteConfirmId(null)}
            onConfirm={confirmDeleteAction}
            title="Elimina Utente"
            message="Sei sicuro di voler eliminare questo utente? Questa azione è irreversibile e cancellerà tutti i dati associati."
            isDestructive
        />
        <div className="space-y-6 p-1">
            {/* Filters Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white/50 p-4 rounded-2xl shadow-sm border border-gray-100 backdrop-blur-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cerca utente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 min-w-[200px] relative after:content-['▼'] after:absolute after:right-3 after:top-1/2 after:-translate-y-1/2 after:text-[10px] after:text-gray-400 after:pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400 absolute left-3 z-10 top-1/2 -translate-y-1/2" />
                    <select 
                        className="flex-1 h-11 pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as RoleName | 'ALL')}
                    >
                        <option value="ALL">Tutti i ruoli</option>
                        {TOGGLEABLE_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6 font-semibold text-gray-600">Utente</th>
                                <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Email</th>
                                <th className="p-4 font-semibold text-gray-600">Classe</th>
                                <th className="p-4 font-semibold text-gray-600">Ruoli & Permessi</th>
                                <th className="p-4 pr-6 font-semibold text-gray-600 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                                        Nessun utente corrisponde ai criteri di ricerca.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                const userRoles = user.roles.map(r => r.role);
                                const initials = user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                                
                                return (
                                    <tr key={user.id} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500 md:hidden">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 hidden md:table-cell font-mono text-xs">{user.email}</td>
                                        <td className="p-4">
                                            {user.class ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    {user.class.year}{user.class.section}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {TOGGLEABLE_ROLES.map((role) => {
                                                    const isActive = userRoles.includes(role);
                                                    
                                                    let activeClass = "";
                                                    if (isActive) {
                                                        if (role === 'ADMIN') activeClass = "bg-purple-100 text-purple-700 border-purple-200 ring-purple-100";
                                                        else if (role === 'MODERATOR') activeClass = "bg-orange-100 text-orange-700 border-orange-200 ring-orange-100";
                                                        else if (role === 'SCHOOL_REP') activeClass = "bg-red-100 text-red-700 border-red-200 ring-red-100";
                                                        else activeClass = "bg-green-100 text-green-700 border-green-200 ring-green-100";
                                                    } else {
                                                        activeClass = "bg-gray-50 text-gray-400 border-gray-200 opacity-60 hover:opacity-100 hover:bg-gray-100 hover:text-gray-600";
                                                    }

                                                    return (
                                                        <button
                                                            key={role}
                                                            disabled={isPending}
                                                            onClick={() => handleToggleRole(user.id, role)}
                                                            className={`
                                                                flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border transition-all duration-200
                                                                ${activeClass} ${isActive ? 'ring-2 ring-offset-1 shadow-sm' : ''}
                                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                            `}
                                                            title={isActive ? "Rimuovi ruolo" : "Assegna ruolo"}
                                                        >
                                                            {getRoleIcon(role)}
                                                            <span>
                                                                {role === 'ADMIN' && 'Admin'}
                                                                {role === 'MODERATOR' && 'Mod'}
                                                                {role === 'SCHOOL_REP' && 'R.Ist'}
                                                                {role === 'CLASS_REP' && 'R.Cls'}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button 
                                                onClick={() => setDeleteConfirmId(user.id)}
                                                disabled={isPending}
                                                className="group/btn relative p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-600 transition-all disabled:opacity-50"
                                                title="Elimina account definitivamente"
                                            >
                                                <Trash2 size={18} />
                                                <span className="sr-only">Elimina</span>
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </>
    );
}
