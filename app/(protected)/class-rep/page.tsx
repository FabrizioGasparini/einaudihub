import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/authz";
import Link from "next/link";
import { PlusCircle, MessageCircle, BarChart2, Users, ArrowRight } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { ScaleIn, FadeIn, StaggerContainer } from "@/components/MotionWrappers";

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
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-green-200/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
            <div className="absolute top-[40%] right-[20%] w-96 h-96 bg-emerald-200/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
        </div>

      <div className="max-w-5xl mx-auto space-y-10">
        <ScaleIn>
             <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Users size={200} />
                 </div>
                 <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-2">
                         <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide border border-white/20">
                             Rappresentante {className}
                         </span>
                     </div>
                     <h1 className="text-4xl font-black tracking-tight mb-2">Gestione Classe</h1>
                     <p className="text-emerald-100 text-lg max-w-xl">
                         Strumenti per organizzare e comunicare con i tuoi compagni.
                     </p>
                 </div>
             </div>
        </ScaleIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Class Announcements */}
            <Link href="/announcements" className="group block">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-2">
                    <div className="absolute top-0 right-0 bg-blue-500/5 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <MessageCircle size={32} />
                            </div>
                            <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Avvisi di Classe</h3>
                        <p className="text-gray-500 mb-6 flex-grow">
                            Invia comunicazioni ufficiali, appunti o promemoria visibili a tutta la classe.
                        </p>
                        <span className="text-sm font-bold text-blue-600 group-hover:underline">Vai agli annunci &rarr;</span>
                    </div>
                </div>
            </Link>
            
            {/* Class Polls */}
            <Link href="/board/new?type=POLL&scope=CLASS" className="group block">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-2">
                    <div className="absolute top-0 right-0 bg-green-500/5 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="bg-green-100 p-4 rounded-2xl text-green-600 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                <BarChart2 size={32} />
                            </div>
                            <div className="bg-gray-100 p-2 rounded-full group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Sondaggi di Classe</h3>
                        <p className="text-gray-500 mb-6 flex-grow">
                            Prendi decisioni democratiche su gite, interrogazioni o date importanti tramite voto.
                        </p>
                        <span className="text-sm font-bold text-green-600 group-hover:underline">Crea sondaggio &rarr;</span>
                    </div>
                </div>
            </Link>
        </StaggerContainer>
      </div>
    </div>
  );
}

