import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/authz";
import Link from "next/link";
import type { SessionUser } from "@/lib/types";
import { Users, School, Settings, FileText } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  if (!isAdmin(user)) {
    redirect("/home");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Area Amministratore</h1>
        <p className="text-gray-600">
          Gestione avanzata di utenti, ruoli, classi e impostazioni di sistema.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-blue-500 transition-colors cursor-pointer group">
          <Users className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-lg">Utenti</h3>
          <p className="text-xs text-gray-500 mt-1">Gestione account e ruoli</p>
        </Link>
        <Link href="/admin/classes" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-blue-500 transition-colors cursor-pointer group">
          <School className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-lg">Classi</h3>
          <p className="text-xs text-gray-500 mt-1">Configurazione sezioni</p>
        </Link>
        <Link href="/admin/moderation" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-blue-500 transition-colors cursor-pointer group">
          <FileText className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-lg">Contenuti</h3>
          <p className="text-xs text-gray-500 mt-1">Moderazione globale</p>
        </Link>
        <Link href="/admin/settings" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-blue-500 transition-colors cursor-pointer group">
          <Settings className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-lg">Impostazioni</h3>
          <p className="text-xs text-gray-500 mt-1">Configurazione sistema</p>
        </Link>
      </div>
    </div>
  );
}

