import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import { SessionUser } from "@/lib/types";
import LogsViewer from "./LogsViewer";
import { ShieldAlert } from "lucide-react";

export const metadata = {
    title: "Audit Logs - Admin Dashboard",
};

export default async function AdminLogsPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user || !user.roles.some(r => r.role === "ADMIN")) {
        redirect("/");
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <ShieldAlert size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Audit Logs</h1>
                </div>
                <p className="text-gray-500 max-w-2xl">
                    Visualizza e monitora tutte le attività sensibili e gli eventi di sistema registrati nella piattaforma.
                </p>
            </div>

            <LogsViewer />
        </div>
    );
}
