import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/authz";
import Link from "next/link";
import type { SessionUser } from "@/lib/types";
import { Users, School, Settings, FileText, Shield, Activity, Lock } from "lucide-react";
import { FadeIn, ScaleIn, SlideIn, StaggerContainer } from "@/components/MotionWrappers";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  if (!isAdmin(user)) {
    redirect("/home");
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
       {/* Animated Background */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-slate-300/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
            <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-indigo-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
        </div>

      <div className="max-w-6xl mx-auto space-y-10">
        <ScaleIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-900 shadow-2xl p-8 mb-8 text-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Shield size={180} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                <Lock className="text-indigo-300" size={20} />
                            </div>
                            <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs">System Admin</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 text-white">
                            Pannello di Controllo
                        </h1>
                        <p className="text-indigo-200 text-lg max-w-xl font-light">
                            Gestione centralizzata dell'infrastruttura scolastica, utenti e sicurezza.
                        </p>
                    </div>
                </div>
            </div>
        </ScaleIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/users" className="group block h-full">
                <div className="h-full bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300 group-hover:-translate-y-1">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                         <Users size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Utenti</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Gestione account, assegnazione ruoli e permessi speciali.
                    </p>
                </div>
            </Link>

            <Link href="/admin/classes" className="group block h-full">
                <div className="h-full bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300 group-hover:-translate-y-1">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                         <School size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Classi</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Configurazione anni scolastici e sezioni.
                    </p>
                </div>
            </Link>

            <Link href="/admin/logs" className="group block h-full">
                <div className="h-full bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300 group-hover:-translate-y-1">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                         <Activity size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Logs & Audit</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Audit logs di sistema, sicurezza e tracciamento attività.
                    </p>
                </div>
            </Link>

            <Link href="/admin/settings" className="group block h-full">
                <div className="h-full bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300 group-hover:-translate-y-1">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                         <Settings size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Impostazioni</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Variabili globali e configurazione della piattaforma.
                    </p>
                </div>
            </Link>
        </StaggerContainer>
      </div>
    </div>
  );
}

