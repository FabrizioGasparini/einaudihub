"use client";

import { useState, useTransition } from 'react';
import ConfirmModal from "@/components/ui/ConfirmModal"; 
import AlertModal from "@/components/ui/AlertModal";
import { togglePostLike, deletePost, reportPost } from './actions';
import { useRouter } from 'next/navigation';
import { Edit, Flag, Heart, MessageSquare, MoreVertical, Share2, Trash, User } from 'lucide-react';
import UserRoleBadge, { RoleType } from '@/components/UserRoleBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCardProps {
    currentUserId: string;
    currentUserRoles?: string[];
    currentUserClassId?: string;
    post: {
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        classId?: string | null;
        author: {
            id: string;
            name: string;
            roles: { role: string }[];
        };
        category: {
            name: string;
        } | null;
        _count: {
            comments: number;
            likes: number;
        };
        likes: { userId: string }[];
    };
}

function getRandomColor(name: string) {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getDisplayRole(roles: { role: string }[]): RoleType {
    if (!roles || roles.length === 0) return 'STUDENT';
    const roleNames = roles.map(r => r.role);
    if (roleNames.includes('SCHOOL_REP')) return 'SCHOOL_REP';
    if (roleNames.includes('CLASS_REP')) return 'CLASS_REP';
    if (roleNames.includes('ADMIN')) return 'ADMIN';
    if (roleNames.includes('MODERATOR')) return 'MODERATOR';
    return 'STUDENT';
}

export default function PostCard({ post, currentUserId, currentUserRoles = [], currentUserClassId }: PostCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isLiked, setIsLiked] = useState(post.likes.some(l => l.userId === currentUserId));
    const [likeCount, setLikeCount] = useState(post._count.likes);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Modals state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [alertState, setAlertState] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
        isOpen: false, title: '', message: '', type: 'success'
    });

    const isAuthor = currentUserId === post.author.id;
    const isAdmin = currentUserRoles.includes('ADMIN') || currentUserRoles.includes('MODERATOR');
    const isClassRep = currentUserRoles.includes('CLASS_REP');
    const isClassPost = post.classId && post.classId === currentUserClassId;
    
    // Class Rep can delete posts in their class board
    const canDelete = isAuthor || isAdmin || (isClassRep && isClassPost);

    const authorInitials = post.author.name.substring(0, 2).toUpperCase();
    const bgAvatar = getRandomColor(post.author.name);
    const displayRole = getDisplayRole(post.author.roles);

    const handleLike = async () => {
        // Optimistic UI
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            await togglePostLike(post.id);
            router.refresh();
        } catch (error) {
            // Revert
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const confirmDelete = async () => {
        startTransition(async () => {
            const res = await deletePost(post.id);
            if (res.success) {
                setShowDeleteModal(false);
                router.refresh();
            } else {
                setAlertState({ isOpen: true, title: "Errore", message: res.error || "Impossibile eliminare", type: 'error' });
                setShowDeleteModal(false);
            }
        });
    };

    const confirmReport = async () => {
        startTransition(async () => {
             const res = await reportPost(post.id, "Segnalazione generica");
             setShowReportModal(false);
             if (res.success) {
                 setAlertState({ isOpen: true, title: "Segnalazione Inviata", message: "Grazie per aver contribuito alla sicurezza.", type: 'success' });
             } else {
                 setAlertState({ isOpen: true, title: "Errore", message: "Impossibile inviare la segnalazione.", type: 'error' });
             }
        });
    };

    return (
        <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 hover:shadow-xl transition-shadow duration-300"
        >
            {/* Header: Author & Controls */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${bgAvatar} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white`}>
                        {authorInitials}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-gray-900">{post.author.name}</span>
                             {displayRole !== 'STUDENT' && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    displayRole === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                    displayRole === 'MODERATOR' ? 'bg-green-100 text-green-700' :
                                    displayRole === 'SCHOOL_REP' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {displayRole === 'SCHOOL_REP' ? 'RAP' : displayRole}
                                </span>
                             )}
                        </div>
                        <span className="text-xs text-gray-500">
                             {new Date(post.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                             {post.classId && <span className="ml-1 text-gray-400 font-medium"> • @{post.category?.name || 'Classe'}</span>}
                        </span>
                    </div>
                </div>

                <div className="relative">
                    <button 
                         onClick={() => setIsMenuOpen(!isMenuOpen)}
                         className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                                >
                                    {(isAuthor || canDelete) && (
                                        <>
                                            {isAuthor && (
                                            <button className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                                                <Edit size={16} className="text-blue-500" />
                                                Modifica
                                            </button>
                                            )}
                                            <button 
                                                onClick={() => setShowDeleteModal(true)}
                                                className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-red-50 text-red-600 font-medium transition-colors"
                                            >
                                                <Trash size={16} className="text-red-500" />
                                                Elimina
                                            </button>
                                            <div className="border-t border-gray-50 my-1"></div>
                                        </>
                                    )}
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                    >
                                        <Flag size={16} className="text-orange-500" />
                                        Segnala
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Post Content */}
            <div 
                className="px-6 py-5 cursor-pointer" 
                onClick={() => router.push(`/board/${post.id}`)}
            >
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{post.title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-6 mb-4">
                    {post.content}
                </p>
                {post.content.length > 300 && (
                    <span className="text-blue-600 text-sm font-semibold hover:underline">Leggi tutto</span>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isLiked 
                            ? 'bg-red-50 text-red-600 ring-1 ring-red-200 shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <Heart size={18} className={isLiked ? "fill-current" : ""} />
                        <span>{likeCount}</span>
                    </motion.button>

                    <motion.button 
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => router.push(`/board/${post.id}`)}
                         className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                    >
                        <MessageSquare size={18} />
                        <span>{post._count.comments}</span>
                    </motion.button>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                >
                    <Share2 size={18} />
                </motion.button>
            </div>

            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Eliminazione Post"
                message="Sei sicuro di voler eliminare questo post? Questa azione è irreversibile."
                isDestructive={true}
                confirmText="Elimina"
                isLoading={isPending}
            />

            <ConfirmModal 
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onConfirm={confirmReport}
                title="Segnala Contenuto"
                message="Vuoi segnalare questo contenuto agli amministratori?"
                confirmText="Segnala"
                isLoading={isPending}
            />
            
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
        </motion.article>
    );
}