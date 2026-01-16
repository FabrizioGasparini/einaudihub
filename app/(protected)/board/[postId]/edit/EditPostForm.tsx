'use client';

import { updatePost } from "@/app/board-actions";
import { useActionState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category } from "@prisma/client";

interface PostData {
    id: string;
    title: string;
    content: string;
    categoryId: string | null;
}

const initialState: any = {
  error: "",
  success: false
};

interface EditPostFormProps {
    post: PostData;
    categories: Category[];
}

export default function EditPostForm({ post, categories }: EditPostFormProps) {
    const [state, formAction, isPending] = useActionState(updatePost, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push(`/board/${post.id}`);
            router.refresh();
        }
    }, [state.success, router, post.id]);

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="postId" value={post.id} />
             {state.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titolo</label>
                <input 
                    name="title" 
                    type="text" 
                    required 
                    minLength={5}
                    defaultValue={post.title}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Titolo del post"
                />
            </div>
            
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                 <select
                    name="categoryId"
                    defaultValue={post.categoryId || ""}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Contenuto</label>
                 <textarea 
                    name="content" 
                    required 
                    minLength={10}
                    defaultValue={post.content}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Scrivi il tuo post..."
                 />
            </div>

            <div className="flex gap-4 pt-4">
                <Link 
                    href={`/board/${post.id}`}
                    className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all text-center"
                >
                    Annulla
                </Link>
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Salva
                </button>
            </div>
        </form>
    );
}
