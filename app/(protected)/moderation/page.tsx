import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";
import { userHasPermission } from "@/lib/authz";
import ModerationList from "./ModerationList";
import { ScaleIn, FadeIn } from "@/components/MotionWrappers";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default async function ModerationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  if (!userHasPermission(user, "MODERATE_PLATFORM")) {
      return (
          <div className="p-10 text-center">
              <h1 className="text-2xl font-bold text-red-600">Accesso Negato</h1>
              <p>Non hai i permessi per accedere a questa pagina.</p>
          </div>
      );
  }

  const reports = await prisma.report.findMany({
      where: { handled: false },
      include: {
          reporter: { select: { name: true, email: true } },
          post: { select: { id: true, title: true, content: true, author: { select: { name: true } } } },
          comment: { select: { id: true, content: true, author: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[20%] right-[30%] w-80 h-80 bg-orange-200/20 rounded-full blur-[90px] animate-blob mix-blend-multiply filter"></div>
            <div className="absolute bottom-[20%] left-[20%] w-80 h-80 bg-red-200/20 rounded-full blur-[90px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
        </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <ScaleIn>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-orange-500 to-red-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <ShieldAlert size={150} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black tracking-tight mb-2">Centro Moderazione</h1>
                    <p className="text-orange-100 font-medium max-w-lg">
                        Gestisci le segnalazioni e mantieni la community sicura.
                    </p>
                </div>
                
                <div className="relative z-10 bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[150px] text-center border border-white/20 shadow-sm">
                    <div className="text-3xl font-black">{reports.length}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-orange-100">Segnalazioni attive</div>
                </div>
            </div>
        </ScaleIn>
        
        <FadeIn delay={0.2}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 overflow-hidden ring-1 ring-black/5">
                {reports.length === 0 ? (
                    <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                        <div className="bg-green-100 p-4 rounded-full mb-6">
                            <CheckCircle2 size={40} className="text-green-600" />
                        </div>
                        <p className="text-xl font-bold text-gray-800 mb-2">Tutto tranquillo!</p>
                        <p className="text-sm">Nessuna segnalazione in attesa di revisione.</p>
                    </div>
                ) : (
                    <ModerationList reports={reports} />
                )}
            </div>
        </FadeIn>
      </div>
    </div>
  );
}

