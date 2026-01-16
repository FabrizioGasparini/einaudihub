"use client";

import { useActionState, useEffect } from "react";
// ^ Note: Next.js 15/16 uses useActionState or useFormState.
// Since I see 'react-dom' 19 in package.json, it's useActionState from "react".
import { createPost } from "@/app/board-actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type UserProps = {
  classId?: string | null;
};

export function CreatePostForm({ categories, user, onSuccess }: { categories: Category[]; user: UserProps; onSuccess?: () => void }) {
  const [state, action, pending] = useActionState(createPost, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      if (onSuccess) {
        onSuccess();
        router.refresh();
      } else {
        router.push("/board");
      }
    }
  }, [state?.success, onSuccess, router]);

  return (
    <form action={action} className="space-y-4">
      
      {state?.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
        <input 
          type="text" 
          name="title" 
          required 
          minLength={5}
          maxLength={100}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          placeholder="Es. Cerco libro di matematica 3° anno..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select 
          name="categoryId" 
          required
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
          <option value="">Seleziona...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Visibilità</label>
        <div className="space-y-2">
            <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                <input type="radio" name="scope" value="GLOBAL" defaultChecked />
                <div>
                   <span className="font-bold block text-sm">Tutta la scuola</span>
                   <span className="text-xs text-gray-500">Visibile a tutti gli studenti dell'istituto</span>
                </div>
            </label>
            
            {user.classId && (
                <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="scope" value="CLASS" />
                    <div>
                        <span className="font-bold block text-sm">Solo la mia classe</span>
                        <span className="text-xs text-gray-500">Visibile solo ai compagni</span>
                    </div>
                </label>
            )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenuto</label>
        <textarea 
          name="content" 
          required 
          minLength={10}
          rows={5}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          placeholder="Scrivi qui..."
        />
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={pending}
          className="w-full text-center bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {pending && <Loader2 className="animate-spin" size={18} />}
          {pending ? "Pubblicazione..." : "Pubblica Post"}
        </button>
      </div>

    </form>
  );
}
