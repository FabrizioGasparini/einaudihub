import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/authz";
import Link from "next/link";
import { PlusCircle, Megaphone, Calendar, BarChart2 } from "lucide-react";
import type { SessionUser } from "@/lib/types";

export default async function SchoolRepPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  if (!userHasPermission(user, "CREATE_SCHOOL_ANNOUNCEMENT")) {
    redirect("/home");
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <header className="px-4 md:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Area Rappresentante d'Istituto</h1>
        <p className="text-gray-600">
          Strumenti di amministrazione per la comunicazione scolastica.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
        {/* Announcements */}
        <Link href="/announcements" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-red-500 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-red-100 p-3 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Megaphone size={24} />
             </div>
             <PlusCircle size={20} className="text-gray-400 group-hover:text-red-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Avvisi Ufficiali</h3>
          <p className="text-sm text-gray-500 mt-2">Pubblica circolari e comunicazioni per tutto l'istituto.</p>
        </Link>
        
        {/* Polls */}
        <Link href="/polls/new" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-purple-500 transition-all group">
           <div className="flex items-center justify-between mb-4">
             <div className="bg-purple-100 p-3 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <BarChart2 size={24} />
             </div>
             <PlusCircle size={20} className="text-gray-400 group-hover:text-purple-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Sondaggi Globali</h3>
          <p className="text-sm text-gray-500 mt-2">Crea votazioni per raccogliere l'opinione degli studenti.</p>
        </Link>

        {/* Events (Future) */}
        <div className="block p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 opacity-60 cursor-not-allowed">
           <div className="flex items-center justify-between mb-4">
             <div className="bg-gray-200 p-3 rounded-lg text-gray-400">
                <Calendar size={24} />
             </div>
          </div>
          <h3 className="font-bold text-lg text-gray-400">Eventi (Presto)</h3>
          <p className="text-sm text-gray-400 mt-2">Gestione assemblee e attività extrascolastiche.</p>
        </div>
      </div>
    </div>
  );
}

