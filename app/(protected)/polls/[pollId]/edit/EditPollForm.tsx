'use client';

import { updatePoll } from "@/app/poll-actions";
import { useActionState, useEffect } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PollData {
    id: string;
    question: string;
    endsAt: Date | null;
    options: { id: string; text: string }[];
}

const initialState: any = {
  error: "",
  success: false
};

export default function EditPollForm({ poll }: { poll: PollData }) {
    const [state, formAction, isPending] = useActionState(updatePoll, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push("/polls");
            router.refresh();
        }
    }, [state.success, router]);

    // Format Date for Input datetime-local (YYYY-MM-DDTHH:mm)
    const formattedEndsAt = poll.endsAt 
        ? new Date(poll.endsAt.getTime() - poll.endsAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        : "";

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="pollId" value={poll.id} />

            {state.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Domanda</label>
                <input 
                    name="question" 
                    type="text" 
                    required 
                    minLength={5}
                    defaultValue={poll.question}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Opzioni (Non modificabili)</label>
                <div className="space-y-2">
                    {poll.options.map((opt) => (
                        <div key={opt.id} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-600">
                            {opt.text}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Le opzioni non possono essere modificate per garantire la validità dei voti.
                </p>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Scadenza</label>
                <input 
                    name="endsAt" 
                    type="datetime-local" 
                    defaultValue={formattedEndsAt}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-2">
                    Lasciare vuoto per nessuna scadenza.
                </p>
            </div>

            <div className="flex gap-4 pt-4">
                <Link 
                    href="/polls"
                    className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all text-center"
                >
                    Annulla
                </Link>
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Salva Modifiche
                </button>
            </div>
        </form>
    );
}
