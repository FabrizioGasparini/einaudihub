"use client";

import { useState, useTransition, useRef } from "react";
import { createPost } from "@/app/board-actions";
import { createAnnouncement } from "@/app/announcement-actions";
import { createEvent } from "@/app/event-actions";
import { createPoll } from "@/app/poll-actions";
import { Loader2, Send, CheckCircle2, Megaphone, Calendar, BarChart2, MessageSquare, Plus, Trash2, Globe, Users, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Category = {
  id: string;
  name: string;
};

type UserProps = {
  classId?: string | null;
  className?: string | null; 
};

type ContentType = 'POST' | 'ANNOUNCEMENT' | 'EVENT' | 'POLL';

interface CreatePostFormProps {
    categories: Category[];
    user: UserProps;
    onSuccess?: () => void;
    defaultScope?: 'GLOBAL' | 'CLASS';
    defaultType?: ContentType;
    permissions: {
        canCreatePost: boolean;
        canCreateAnnouncement: boolean;
        canCreateEvent: boolean;
        canCreatePoll: boolean;
    };
    isAdmin?: boolean;
    allClasses?: { id: string; year: number; section: string }[];
}

export function CreatePostForm({ categories, user, onSuccess, defaultScope = 'GLOBAL', defaultType, permissions, isAdmin, allClasses = [] }: CreatePostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [type, setType] = useState<ContentType>(() => {
    if (defaultType) {
        if (defaultType === 'POST' && permissions.canCreatePost) return 'POST';
        if (defaultType === 'ANNOUNCEMENT' && permissions.canCreateAnnouncement) return 'ANNOUNCEMENT';
        if (defaultType === 'EVENT' && permissions.canCreateEvent) return 'EVENT';
        if (defaultType === 'POLL' && permissions.canCreatePoll) return 'POLL';
    }
    return permissions.canCreatePost ? 'POST' : (permissions.canCreateAnnouncement ? 'ANNOUNCEMENT' : 'EVENT');
  }); 
  const [scope, setScope] = useState<'GLOBAL' | 'CLASS'>(defaultScope);
  const [targetClassId, setTargetClassId] = useState(user.classId || "");

  // Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Description for event
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  
  // Event Fields
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Poll Fields
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollEndsAt, setPollEndsAt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("scope", scope); 

    // Inject target class ID if admin overriding
    if (isAdmin && scope === 'CLASS' && targetClassId) {
        formData.append("targetClassId", targetClassId);
    } 
    // Standard user behavior relies on backend session.user.classId, no need to append explicit classId unless debugging
 

    startTransition(async () => {
        let result;
        // ... (rest logic remains similar but ensures classId is sent if needed, though backend actions might need update to read it)

        if (type === 'POST') {
            formData.append("title", title);
            formData.append("content", content);
            formData.append("categoryId", categoryId);
            // Post uses GLOBAL/CLASS
            result = await createPost(null, formData);
        } 
        else if (type === 'ANNOUNCEMENT') {
            formData.append("title", title);
            formData.append("content", content);
            // Announcement uses SCHOOL/CLASS. Map GLOBAL -> SCHOOL
            formData.set("scope", scope === 'GLOBAL' ? 'SCHOOL' : 'CLASS');
            result = await createAnnouncement(null, formData);
        }
        else if (type === 'EVENT') {
            formData.append("title", title);
            formData.append("description", content);
            formData.append("date", eventDate);
            formData.append("location", eventLocation);
            // Event uses GLOBAL/CLASS
            result = await createEvent(null, formData);
        }
        else if (type === 'POLL') {
            formData.append("question", pollQuestion); // Poll uses 'question' not title
            formData.append("options", JSON.stringify(pollOptions.filter(o => o.trim() !== "")));
            if (pollEndsAt) formData.append("endsAt", pollEndsAt);
            // Poll uses SCHOOL/CLASS. Map GLOBAL -> SCHOOL
            formData.set("scope", scope === 'GLOBAL' ? 'SCHOOL' : 'CLASS');
            result = await createPoll(null, formData);
        }

        if (result?.error) {
            setError(typeof result.error === 'string' ? result.error : "Errore sconosciuto");
        } else {
            setSuccess(true);
            if (onSuccess) {
                onSuccess();
            } else {
                // Redirect based on type
                if (type === 'POST') router.push("/board");
                else if (type === 'ANNOUNCEMENT') router.push("/announcements");
                else if (type === 'EVENT') router.push("/events");
                else if (type === 'POLL') router.push("/polls");
                else router.refresh();
            }
        }
    });
  };

  const addPollOption = () => setPollOptions([...pollOptions, ""]);
  const removePollOption = (index: number) => {
      if (pollOptions.length > 2) {
          const newOptions = [...pollOptions];
          newOptions.splice(index, 1);
          setPollOptions(newOptions);
      }
  };
  const updatePollOption = (index: number, value: string) => {
      const newOptions = [...pollOptions];
      newOptions[index] = value;
      setPollOptions(newOptions);
  };

  return (
    <div className="space-y-8">
        {/* Type Selector Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-2xl gap-1 overflow-x-auto">
            {permissions.canCreatePost && (
                <button
                    type="button"
                    onClick={() => setType('POST')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'POST' ? 'bg-white shadow-md text-indigo-900' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <MessageSquare size={18} /> Conversazione
                </button>
            )}
            {permissions.canCreateAnnouncement && (
                <button
                    type="button"
                    onClick={() => setType('ANNOUNCEMENT')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'ANNOUNCEMENT' ? 'bg-white shadow-md text-indigo-900' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <Megaphone size={18} /> Annuncio
                </button>
            )}
            {permissions.canCreateEvent && (
                 <button
                    type="button"
                    onClick={() => setType('EVENT')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'EVENT' ? 'bg-white shadow-md text-indigo-900' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <Calendar size={18} /> Evento
                </button>
            )}
            {permissions.canCreatePoll && (
                 <button
                    type="button"
                    onClick={() => setType('POLL')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'POLL' ? 'bg-white shadow-md text-indigo-900' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <BarChart2 size={18} /> Sondaggio
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Scope Selector */}
            <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${scope === 'GLOBAL' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
                    <input type="radio" value="GLOBAL" checked={scope === 'GLOBAL'} onChange={() => setScope('GLOBAL')} className="hidden" />
                    <Globe size={24} />
                    <span className="font-bold">Pubblico (Istituto)</span>
                </label>
                <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${scope === 'CLASS' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'} ${(!user.classId && !isAdmin) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="radio" value="CLASS" checked={scope === 'CLASS'} onChange={() => setScope('CLASS')} disabled={!user.classId && !isAdmin} className="hidden" />
                    <Users size={24} />
                    <span className="font-bold">Classe {user.className || (isAdmin ? "(Admin)" : "")}</span>
                </label>
            </div>

            {/* Admin Class Selector override */}
            {isAdmin && scope === 'CLASS' && allClasses && allClasses.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <label className="block text-sm font-bold text-yellow-800 mb-2">Seleziona Classe (Admin Mode)</label>
                    <select 
                        value={targetClassId} 
                        onChange={(e) => setTargetClassId(e.target.value)}
                        className="w-full p-2 rounded-lg border border-yellow-300 bg-white text-gray-800 font-medium"
                    >
                        <option value="">-- Seleziona Classe Target --</option>
                        {allClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.year}{c.section}</option>
                        ))}
                    </select>
                    <p className="text-xs text-yellow-600 mt-2">Stai agendo come amministratore per questa classe.</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full bg-red-500"></span>
                    {error}
                </div>
            )}

            {/* Dynamic Fields */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                >
                    {/* Title / Question */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            {type === 'POLL' ? 'Domanda del sondaggio' : 'Titolo'}
                        </label>
                        {type === 'POLL' ? (
                            <input
                                type="text"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium"
                                placeholder="Cosa vuoi chiedere?"
                                required
                            />
                        ) : (
                             <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-bold text-lg"
                                placeholder={type === 'EVENT' ? "Titolo dell'evento" : "Scrivi un titolo accattivante..."}
                                required
                            />
                        )}
                    </div>

                    {/* Content / Description (Not for Polls) */}
                    {type !== 'POLL' && (
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">
                                {type === 'EVENT' ? 'Descrizione Dettagliata' : 'Contenuto'}
                            </label>
                            <textarea
                                name="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none bg-gray-50/50"
                                placeholder={type === 'EVENT' ? "Descrivi il programma dell'evento..." : "Scrivi qui il tuo messaggio..."}
                                required
                            />
                        </div>
                    )}

                    {/* Category (Only for Post) */}
                    {type === 'POST' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${categoryId === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Event Specifics */}
                    {type === 'EVENT' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Data e Ora</label>
                                <input
                                    type="datetime-local"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Luogo (Opzionale)</label>
                                <input
                                    type="text"
                                    value={eventLocation}
                                    onChange={(e) => setEventLocation(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Es. Aula Magna, Zoom, ecc."
                                />
                            </div>
                        </div>
                    )}

                    {/* Poll Specifics */}
                    {type === 'POLL' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Opzioni</label>
                                <div className="space-y-3">
                                    {pollOptions.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updatePollOption(idx, e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder={`Opzione ${idx + 1}`}
                                                required
                                            />
                                            {pollOptions.length > 2 && (
                                                <button type="button" onClick={() => removePollOption(idx)} className="text-gray-400 hover:text-red-500 px-2 transition-colors">
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addPollOption} className="mt-2 text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                    <Plus size={16} /> Aggiungi Opzione
                                </button>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Scadenza (Opzionale)</label>
                                <input
                                    type="datetime-local"
                                    value={pollEndsAt}
                                    onChange={(e) => setPollEndsAt(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                 <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                >
                    {isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    {type === 'POST' ? 'Pubblica Post' : type === 'ANNOUNCEMENT' ? 'Pubblica Annuncio' : type === 'EVENT' ? 'Crea Evento' : 'Avvia Sondaggio'}
                </button>
            </div>

        </form>
    </div>
  );
}
