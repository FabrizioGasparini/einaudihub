import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/authz";
import Link from "next/link";
import { PlusCircle, MessageCircle, BarChart2 } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export default async function ClassRepPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  // Check generic class rep permission or specifically create class announcement
  if (!userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT")) {
    redirect("/home");
  }

  let classDetails = null;
  if (user.classId) {
    classDetails = await prisma.class.findUnique({
      where: { id: user.classId }
    });
  }

  const className = classDetails ? `${classDetails.year}${classDetails.section}` : "";

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <header className="px-4 md:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Area Rappresentante di Classe</h1>
        <p className="text-gray-600">
          Gestisci la comunicazione per la classe {className}.
        </p>
      </header>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
        {/* Class Announcements */}
        <Link href="/announcements" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-blue-500 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-blue-100 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MessageCircle size={24} />
             </div>
             <PlusCircle size={20} className="text-gray-400 group-hover:text-blue-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Avvisi di Classe</h3>
          <p className="text-sm text-gray-500 mt-2">Scrivi alla tua classe. Visibile solo ai tuoi compagni e docenti.</p>
        </Link>
        
        {/* Class Polls */}
        <Link href="/polls/new" className="block p-6 bg-white rounded-xl shadow-sm border hover:border-green-500 transition-all group">
           <div className="flex items-center justify-between mb-4">
             <div className="bg-green-100 p-3 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <BarChart2 size={24} />
             </div>
             <PlusCircle size={20} className="text-gray-400 group-hover:text-green-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Sondaggi di Classe</h3>
          <p className="text-sm text-gray-500 mt-2">Prendi decisioni democratiche su gite, interrogazioni o altro.</p>
        </Link>
      </div>
    </div>
  );
}

