import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, User as UserIcon, AlertCircle } from "lucide-react";

type PollDetailPageProps = {
  params: Promise<{ pollId: string }>;
};

export default async function PollDetailPage({ params }: PollDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;
  
  const { pollId } = await params;

  // Determine if user has "View Results" privilege
  // Admin/Mod always.
  // Class Rep if Class Poll.
  // School Rep if School Poll.
  let canViewDetailedResults = false;
  
  if (userHasPermission(user, "MODERATE_PLATFORM")) {
      canViewDetailedResults = true;
  }
  
  // Need to fetch poll meta first to know scope
  const pollMeta = await prisma.poll.findUnique({ 
      where: { id: pollId },
      select: { classId: true, schoolWide: true, createdById: true }
  });

  if (!pollMeta) notFound();

  // Check Owner logic
  if (pollMeta.createdById === user.id) {
      canViewDetailedResults = true;
  }

  // Check Class Rep logic
  if (pollMeta.classId) {
      if (user.classId !== pollMeta.classId && !canViewDetailedResults) {
          return <div>Accesso negato</div>;
      }
      // Explicit role check for Class Rep of this class
      if (user.roles.some(r => r.role === 'CLASS_REP' && r.classId === pollMeta.classId)) {
        canViewDetailedResults = true;
      }
  }

  // Check School Rep logic
  if (pollMeta.schoolWide) {
      if (user.roles.some(r => r.role === 'SCHOOL_REP' && r.schoolWide)) {
          canViewDetailedResults = true;
      }
  }

  // Fetch logic based on permissions
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
        options: {
            include: {
                _count: { select: { votes: true } },
                // If canViewDetailedResults, we might want voters per option here
                votes: canViewDetailedResults ? {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                } : false
            }
        },
        createdBy: { select: { name: true } }
    }
  });

  if (!poll) notFound();

  // Check if current user voted
  const userVote = await prisma.pollVote.findFirst({
      where: { pollId: poll.id, userId: user.id }
  });

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt._count.votes, 0);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/polls" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
             <ArrowLeft size={16} className="mr-1" /> Torna ai sondaggi
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
                 <h1 className="text-2xl font-bold text-gray-900">{poll.question}</h1>
                 {poll.endsAt && new Date() > poll.endsAt && (
                     <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Terminato</span>
                 )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <span>Creato da {poll.createdBy.name}</span>
                <span>•</span>
                <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                {poll.classId && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold ml-2">Classe</span>}
                {poll.schoolWide && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-bold ml-2">Istituto</span>}
            </div>

            {/* Voting / Results Area */}
            <div className="space-y-4">
                {poll.options.map(option => {
                    const isVoted = userVote?.optionId === option.id;
                    const percent = totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 100) : 0;
                    
                    return (
                        <div key={option.id} className="relative">
                            {/* Bar background for results */}
                            <div className={`relative z-10 p-4 rounded-xl border-2 transition-all cursor-default ${
                                isVoted ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white'
                            }`}>
                                <div className="flex justify-between items-center relative z-20">
                                    <span className={`font-medium ${isVoted ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {option.text}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {isVoted && <CheckCircle2 size={20} className="text-blue-600" />}
                                        <span className="font-bold text-gray-900">{option._count.votes} voti</span>
                                        <span className="text-sm text-gray-500 w-12 text-right">{percent}%</span>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div 
                                    className="absolute top-0 left-0 h-full bg-gray-100 rounded-l-xl opacity-50 transition-all duration-500" 
                                    style={{ width: `${percent}%`, backgroundColor: isVoted ? '#dbeafe' : '#f3f4f6' }}
                                />
                            </div>

                            {/* Detailed Voters List (Only if Privileged) */}
                            {canViewDetailedResults && option.votes && option.votes.length > 0 && (
                                <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Votanti:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {option.votes.map((v: any) => (
                                            <div key={v.user.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded border shadow-sm" title={v.user.name}>
                                                <UserIcon size={12} className="text-gray-400" />
                                                <span className="text-gray-700 truncate max-w-[100px]">{v.user.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between items-center text-sm text-gray-500">
                <p>Totale voti: <span className="font-bold text-gray-900">{totalVotes}</span></p>
                {!userVote && (poll.endsAt ? new Date() < poll.endsAt : true) && (
                    <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle size={16} />
                        <span>Puoi votare dalla lista principale</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

