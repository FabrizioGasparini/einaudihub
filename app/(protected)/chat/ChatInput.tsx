"use client";

import { sendMessage } from "./actions";
import { useState, useTransition, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X } from "lucide-react";
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInput({ conversationId }: { conversationId: string }) {
    const [content, setContent] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus 
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const msg = content;
        setContent(""); 
        setShowEmoji(false);
        
        startTransition(async () => {
             await sendMessage(conversationId, msg);
             setTimeout(() => inputRef.current?.focus(), 100);
        });
    };

    const onEmojiClick = (emojiObject: any) => {
        setContent(prev => prev + emojiObject.emoji);
    };

    return (
        <div className="relative max-w-4xl mx-auto">
            <AnimatePresence>
                {showEmoji && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        className="absolute bottom-20 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-white/40"
                    >
                         <EmojiPicker 
                            onEmojiClick={onEmojiClick} 
                            autoFocusSearch={false}
                            emojiStyle={EmojiStyle.APPLE}
                            height={350}
                            width={320}
                         />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.form 
                onSubmit={handleSubmit} 
                className="flex items-center gap-1 bg-white/90 backdrop-blur-xl p-1.5 pl-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 ring-1 ring-black/5"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10, backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    className="text-gray-500 p-2.5 rounded-full transition-colors flex items-center justify-center shrink-0"
                    title="Allega file"
                >
                     <Paperclip size={20} />
                </motion.button>
                
                <div className="flex-1 relative">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Scrivi un messaggio..."
                        disabled={isPending}
                        className="w-full bg-transparent border-none py-3 text-base focus:outline-none placeholder:text-gray-400 text-gray-800"
                    />
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10, backgroundColor: "#fffbeb" }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={`p-2.5 rounded-full transition-colors shrink-0 ${showEmoji ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500'}`}
                >
                    <Smile size={22} />
                </motion.button>

                <AnimatePresence>
                    {content.trim() && (
                        <motion.button 
                            initial={{ scale: 0, width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ scale: 1, width: "auto", opacity: 1, marginLeft: 8 }}
                            exit={{ scale: 0, width: 0, opacity: 0, marginLeft: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit" 
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center relative overflow-hidden shrink-0"
                        >
                            {isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            ) : (
                                <Send size={18} className="ml-0.5" />
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.form>
        </div>
    );
}

