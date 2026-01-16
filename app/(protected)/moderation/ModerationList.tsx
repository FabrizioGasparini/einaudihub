"use client";

import { useState } from "react";
import { dismissReport, hideContent } from "./actions";
import { AlertTriangle, CheckCircle, EyeOff, MessageSquare, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

// Define a minimal type for the props passed from server component
type ReportItem = {
    id: string;
    createdAt: Date;
    reason: string;
    reporter: { name: string, email: string };
    post?: { id: string; title: string; content: string; author: { name: string } } | null;
    comment?: { id: string; content: string; author: { name: string } } | null;
};

export default function ModerationList({ reports }: { reports: ReportItem[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleDismiss = async (id: string) => {
        setLoading(id);
        await dismissReport(id);
        setLoading(null);
        router.refresh();
    };

    const handleHide = async (reportId: string, type: 'post' | 'comment', contentId: string) => {
        if (!confirm("Sei sicuro di voler nascondere questo contenuto?")) return;
        setLoading(reportId);
        await hideContent(reportId, type, contentId);
        setLoading(null);
        router.refresh();
    };

    return (
        <div className="divide-y divide-gray-100">
            {reports.map(report => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        Segnalazione da {report.reporter.name}
                                    </span>
                                    <h3 className="text-sm font-semibold text-gray-900 mt-1">
                                        Motivo: <span className="text-red-600">{report.reason}</span>
                                    </h3>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="bg-white border rounded-lg p-4 mb-4 text-sm text-gray-700">
                                {report.post && (
                                    <>
                                        <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-xs uppercase">
                                            <FileText size={14} /> Post: {report.post.title}
                                        </div>
                                        <div className="font-semibold mb-1">{report.post.author.name}:</div>
                                        <p className="line-clamp-3">{report.post.content}</p>
                                    </>
                                )}
                                {report.comment && (
                                    <>
                                        <div className="flex items-center gap-2 mb-2 text-purple-600 font-bold text-xs uppercase">
                                            <MessageSquare size={14} /> Commento
                                        </div>
                                        <div className="font-semibold mb-1">{report.comment.author.name}:</div>
                                        <p>{report.comment.content}</p>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => handleDismiss(report.id)}
                                    disabled={loading === report.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <CheckCircle size={16} />
                                    Ignora (Risolvi)
                                </button>
                                
                                {report.post && (
                                    <button 
                                        onClick={() => handleHide(report.id, 'post', report.post!.id)}
                                        disabled={loading === report.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <EyeOff size={16} />
                                        Nascondi Post
                                    </button>
                                )}

                                {report.comment && (
                                    <button 
                                        onClick={() => handleHide(report.id, 'comment', report.comment!.id)}
                                        disabled={loading === report.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <EyeOff size={16} />
                                        Nascondi Commento
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
