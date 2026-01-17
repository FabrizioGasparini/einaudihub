"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose}
            />

            {/* Modal Content */}
            <div 
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 scale-100 ring-1 ring-black/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Minimalist */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
                        <div className="h-1.5 w-12 bg-indigo-500 rounded-full mt-3"></div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-2">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-8 pb-8 pt-4 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
