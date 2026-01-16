import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";
import { userHasPermission } from "@/lib/authz";
import ModerationList from "./ModerationList";

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
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900">Moderazione</h1>
        <p className="text-gray-600">
          Gestisci le segnalazioni e modera i contenuti della piattaforma.
        </p>
      </header>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {reports.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <p className="text-lg">Nessuna segnalazione in sospeso.</p>
                <p className="text-sm">Ottimo lavoro!</p>
            </div>
        ) : (
            <ModerationList reports={reports} />
        )}
      </div>
    </div>
  );
}

