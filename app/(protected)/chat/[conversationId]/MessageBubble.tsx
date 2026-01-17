"use client";

import { useState } from "react";
import { Copy, Trash2, Edit2, MoreHorizontal, X, Check } from "lucide-react";
import { deleteMessage, editMessage } from "../actions";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface MessageBubbleProps {
    message: {
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
    };
    isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const router = useRouter();

    // Check edited status
    const isEdited = new Date(message.updatedAt).getTime() > new Date(message.createdAt).getTime() + 1000;

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setShowMenu(false);
    };

    const handleDelete = () => {
        setConfirmDeleteOpen(true);
        setShowMenu(false);
    };

    const performDelete = async () => {
        await deleteMessage(message.id);
        router.refresh();
        setConfirmDeleteOpen(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setShowMenu(false);
    };

    const submitEdit = async () => {
        if (editContent.trim() !== message.content) {
            await editMessage(message.id, editContent);
            router.refresh();
        }
        setIsEditing(false);
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowMenu(!showMenu);
    };

    return (
        <>
            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={performDelete}
                title="Elimina messaggio"
                message="Sei sicuro di voler eliminare questo messaggio? L'azione è irreversibile."
                isDestructive
            />
        <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative mb-3 w-full`}
        >
            {/* Context Menu Trigger Area */}
            <div 
                className="max-w-[85%] relative"
                onContextMenu={toggleMenu}
            >
                <div className={`px-6 py-4 rounded-3xl text-sm shadow-sm relative transition-all ${
                    isMe 
                    ? 'bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white rounded-br-none shadow-indigo-500/20' 
                    : 'bg-white text-gray-800 border border-gray-100/50 rounded-bl-none shadow-[0_2px_10px_rgb(0,0,0,0.03)]'
                }`}>
                    {!isEditing ? (
                        <p className={`whitespace-pre-wrap leading-relaxed ${isMe ? 'text-white/95' : 'text-gray-800'}`}>{message.content}</p>
                    ) : (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <textarea 
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full text-black p-2 rounded-xl text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400 border-none shadow-inner"
                                rows={2}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-black/10 rounded-full transition-colors"><X size={14} /></button>
                                <button onClick={submitEdit} className="p-1 hover:bg-black/10 rounded-full transition-colors"><Check size={14} /></button>
                            </div>
                        </div>
                    )}
                    
                    <div className={`flex justify-end items-center gap-1.5 mt-1.5 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                        {isEdited && (
                            <span className="text-[9px] font-medium tracking-wide">
                                MODIFICATO
                            </span>
                        )}
                        <span className="text-[10px] font-semibold tracking-wide">
                            {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>

                    {/* Desktop Hover Menu Trigger */}
                    {!isEditing && (
                        <motion.button 
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowMenu(!showMenu)}
                            className={`absolute -top-3 ${isMe ? '-left-3' : '-right-3'} p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-50 rounded-full shadow-lg border border-gray-100 text-gray-400 hover:text-blue-600 z-10`}
                        >
                            <MoreHorizontal size={14} />
                        </motion.button>
                    )}
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowMenu(false)}
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                className={`absolute z-20 top-full ${isMe ? 'right-0' : 'left-0'} mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.1)] border border-white/40 overflow-hidden min-w-[160px] p-1`}
                            >
                                <button onClick={handleCopy} className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50/50 rounded-xl flex items-center gap-3 text-gray-600 font-medium transition-colors">
                                    <Copy size={14} className="text-gray-400" /> Copia
                                </button>
                                {isMe && (
                                    <>
                                        <button onClick={handleEdit} className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50/50 rounded-xl flex items-center gap-3 text-gray-600 font-medium transition-colors">
                                            <Edit2 size={14} className="text-blue-500" /> Modifica
                                        </button>
                                        <button onClick={handleDelete} className="w-full text-left px-3 py-2.5 text-sm hover:bg-red-50/50 rounded-xl flex items-center gap-3 text-red-600 font-medium transition-colors">
                                            <Trash2 size={14} className="text-red-500" /> Elimina
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
        </>
    );
}

