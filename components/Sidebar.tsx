"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutDashboard, 
  Calendar, 
  Vote, 
  School, 
  Users, 
  ShieldAlert, 
  Megaphone, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Moon,
  Sun,
  Palette,
  MessageCircle,
  UserCircle
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { SessionUser } from "@/lib/types";
import { isAdmin, isSchoolOfficial } from "@/lib/authz";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
    user: SessionUser;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ user, mobileOpen = false, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    
    const showAdmin = isAdmin(user);
    const showModeration = isSchoolOfficial(user) || user.roles.some((r: any) => r.role === 'CLASS_REP');
    const showClassRep = user.roles.some((r: any) => r.role === 'CLASS_REP');

    const navItems = [
        { label: "Home", href: "/home", icon: Home },
        { label: "Bacheca", href: "/board", icon: LayoutDashboard },
        { label: "Eventi", href: "/events", icon: Calendar },
        { label: "Sondaggi", href: "/polls", icon: Vote },
        { label: "Chat", href: "/chat", icon: MessageCircle },
    ];

    if (showClassRep) {
        navItems.push({ label: "Gestione Classe", href: "/class-rep", icon: School });
    }

    if (user.classId) {
        navItems.push({ label: "La mia Classe", href: "/my-class", icon: Users });
    }

    if (showModeration) {
        navItems.push({ label: "Moderazione", href: "/moderation", icon: ShieldAlert });
    }
  
    if (showAdmin) {
        navItems.push({ label: "Amministrazione", href: "/admin", icon: Megaphone });
    }

    const NavButton = ({ item }: { item: any }) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
            <Link
                href={item.href}
                className={`
                    relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                    ${isActive 
                        ? "text-blue-600 font-bold" 
                        : "text-gray-500 hover:text-gray-900"
                    }
                `}
                title={collapsed ? item.label : ""}
            >
                {isActive && (
                    <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-blue-50 z-0 rounded-2xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                
                <div className="z-10 relative flex items-center gap-4">
                    <Icon size={22} className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                    {!collapsed && (
                        <span className="text-sm tracking-wide">{item.label}</span>
                    )}
                </div>

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-xl border border-gray-700">
                        {item.label}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <>
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen?.(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside 
                animate={{ width: collapsed ? 90 : 280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                    flex flex-col h-screen border-r bg-white/80 backdrop-blur-xl z-50 shadow-[10px_0_30px_-10px_rgba(0,0,0,0.03)]
                    fixed inset-y-0 left-0 md:sticky md:top-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    transition-transform duration-300 md:transition-none
                `}
            >
            {/* Header / Brand */}
            <div className="p-6 flex items-center justify-between mb-2">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col"
                        >
                            <h1 className="font-black text-2xl text-gray-900 tracking-tighter cursor-pointer" onClick={() => window.location.href = '/'}>
                                Einaudi<span className="text-blue-600">HUB</span>
                            </h1>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">Social 2.0</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900 mx-auto"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2 scrollbar-hide overflow-x-hidden">
                {navItems.map((item) => (
                    <NavButton key={item.href} item={item} />
                ))}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 mx-4 mb-4 relative z-50">
                <AnimatePresence>
                    {showSettings && !collapsed && (
                         <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="absolute bottom-full left-0 w-full mb-3 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden p-2"
                        >
                            <div className="space-y-1">
                                <Link href="/profile" className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                                    <UserCircle size={16} className="text-blue-500" />
                                    Il mio profilo
                                </Link>
                                <button 
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                    onClick={() => setDarkMode(!darkMode)}
                                >
                                    {darkMode ? <Sun size={16} className="text-orange-500" /> : <Moon size={16} className="text-indigo-500" />}
                                    {darkMode ? "Modalità Chiara" : "Modalità Scura"}
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button 
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    <LogOut size={16} />
                                    Cambia Utente (Logout)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div 
                    className={`bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all rounded-2xl p-2 cursor-pointer shadow-sm hover:shadow-md ${collapsed ? 'justify-center' : ''}`}
                    onClick={() => collapsed ? signOut({ callbackUrl: '/login'}) : setShowSettings(!showSettings)}
                >
                    <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between gap-3"}`}>
                        <div className={`
                             rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-md
                             ${collapsed ? "w-10 h-10" : "w-10 h-10"}
                        `}>
                             <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-700 font-bold overflow-hidden">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name[0].toUpperCase()
                                )}
                             </div>
                        </div>

                        {!collapsed && (
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-bold text-gray-900 truncate">{user.name}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400">Online</span>
                            </div>
                        )}

                        {!collapsed && (
                            <motion.div 
                                animate={{ rotate: showSettings ? 180 : 0 }}
                                className="text-gray-400 bg-white p-1.5 rounded-lg shadow-sm"
                            >
                                <Settings size={16} />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            </motion.aside>
        </>
    );
}
