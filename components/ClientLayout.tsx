"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import type { SessionUser } from "@/lib/types";
import { usePathname } from "next/navigation";

interface ClientLayoutProps {
    children: React.ReactNode;
    user: SessionUser;
}

export default function ClientLayout({ children, user }: ClientLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white/80 backdrop-blur-md px-4 py-3 border-b flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">
                    Einaudi<span className="text-blue-600">HUB</span>
                </span>
                <button 
                    className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar */}
            <Sidebar 
                user={user} 
                mobileOpen={mobileMenuOpen} 
                setMobileOpen={setMobileMenuOpen} 
            />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full md:w-auto h-[calc(100vh-65px)] md:h-screen">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
