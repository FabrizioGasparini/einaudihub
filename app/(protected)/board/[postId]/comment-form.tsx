"use client";

import { useActionState } from "react";
import { createComment } from "@/app/board-actions";
import { Loader2, Send } from "lucide-react";
import { useRef } from "react";

export function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(createComment, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Simple trick to clear form on success (action returns user provided success flag or we can assume revalidate works)
  // useActionState doesn't easily expose 'success' unless payload says so.
  // My action returns { success: true } or { error ... }.
  
  if (state?.success && formRef.current) {
      formRef.current.reset();
      // State persists, so we might want to clear it or handle it.
      // But typically a toast or just seeing the comment appear is enough.
  }

  return (
    <form ref={formRef} action={action} className="mt-4 flex gap-2 items-start">
      <input type="hidden" name="postId" value={postId} />
      
      <div className="flex-1">
          <textarea
            name="content"
            required
            rows={1}
            placeholder="Scrivi un commento..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border resize-y text-sm"
          />
          {state?.error && <p className="text-xs text-red-600 mt-1">{state.error}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </form>
  );
}
