'use client';

import { useState, useTransition, useMemo } from "react";
import UserRoleBadge from "@/components/UserRoleBadge";
import { toggleUserRole, deleteUser } from "@/app/admin-actions";
import { RoleName } from "@prisma/client";
import { Trash2, AlertCircle, CheckCircle2, Search, Filter } from "lucide-react";
import type { RoleType } from "@/components/UserRoleBadge";

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

    const handleDelete = (userId: string) => {
        if(!confirm("Sei sicuro di voler eliminare questo utente? Questa azione è irreversibile.")) return;
        
        startTransition(async () => {
             await deleteUser(userId);
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cerca per nome, email o classe..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select 
                        className="flex-1 h-10 px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-700">Utente</th>
                                <th className="p-4 font-semibold text-gray-700">Email</th>
                                <th className="p-4 font-semibold text-gray-700">Classe</th>
                                <th className="p-4 font-semibold text-gray-700">Ruoli</th>
                                <th className="p-4 font-semibold text-gray-700 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Nessun utente trovato con i filtri correnti.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                const userRoles = user.roles.map(r => r.role);
                                
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500 md:hidden">{user.email}</div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-gray-600">{user.email}</td>
                                        <td className="p-4 text-gray-600">
                                            {user.class ? `${user.class.year}${user.class.section}` : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {TOGGLEABLE_ROLES.map((role) => {
                                                    const isActive = userRoles.includes(role);
                                                    // Simplified badge style for toggles
                                                    // Reuse colors from UserRoleBadge config logic manually or simplify
                                                    let baseStyle = "border rounded-full px-2 py-1 text-xs font-medium cursor-pointer transition-all select-none";
                                                    let activeStyle = "";
                                                    
                                                    if (role === 'ADMIN') activeStyle = isActive ? "bg-purple-100 text-purple-700 border-purple-200" : "opacity-40 hover:opacity-100 bg-gray-50";
                                                    if (role === 'MODERATOR') activeStyle = isActive ? "bg-orange-100 text-orange-700 border-orange-200" : "opacity-40 hover:opacity-100 bg-gray-50";
                                                    if (role === 'SCHOOL_REP') activeStyle = isActive ? "bg-red-100 text-red-700 border-red-200" : "opacity-40 hover:opacity-100 bg-gray-50";
                                                    if (role === 'CLASS_REP') activeStyle = isActive ? "bg-green-100 text-green-700 border-green-200" : "opacity-40 hover:opacity-100 bg-gray-50";
                                                    
                                                    return (
                                                        <button
                                                            key={role}
                                                            disabled={isPending}
                                                            onClick={() => handleToggleRole(user.id, role)}
                                                            className={`${baseStyle} ${activeStyle}`}
                                                            title={isActive ? "Rimuovi ruolo" : "Assegna ruolo"}
                                                        >
                                                            {role === 'ADMIN' && 'Admin'}
                                                            {role === 'MODERATOR' && 'Mod'}
                                                            {role === 'SCHOOL_REP' && 'Rep. Ist'}
                                                            {role === 'CLASS_REP' && 'Rep. Class'}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                disabled={isPending}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Elimina utente"
                                            >
                                                <Trash2 size={18} />
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
    );
}
