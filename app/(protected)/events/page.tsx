import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Plus, MapPin, Calendar as CalendarIcon, Users, Sparkles } from "lucide-react";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import EventCard from "./EventCard";
import { FadeIn, ScaleIn, SlideIn, StaggerContainer } from "@/components/MotionWrappers";

async function getEvents(user: SessionUser) {
    const classId = user.classId;
    return await prisma.event.findMany({
        where: {
            date: { gte: new Date(new Date().setHours(0,0,0,0)) }, // From today
            OR: [
                { classId: null }, // Global
                { classId: classId || undefined }
            ]
        },
        include: {
            createdBy: true,
            _count: { select: { participations: true } }
        },
        orderBy: { date: 'asc' }
    });
}

export default async function EventsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    const events = await getEvents(user);
    const canCreate = userHasPermission(user, "CREATE_SCHOOL_EVENT") || userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT");
    
    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-purple-300/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
                <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-pink-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
                <div className="absolute bottom-[10%] left-[30%] w-96 h-96 bg-indigo-300/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply filter"></div>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <ScaleIn>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-900 shadow-2xl p-8 mb-8 text-white">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <CalendarIcon size={180} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                        <CalendarIcon className="text-indigo-300" size={20} />
                                    </div>
                                    <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs">Calendario</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tight mb-2 text-white">
                                    Eventi & Attività
                                </h1>
                                <p className="text-indigo-200 text-lg max-w-xl font-light">
                                    Scopri cosa succede a scuola. Non perderti i prossimi appuntamenti importanti.
                                </p>
                            </div>
                            
                            {canCreate && (
                                <Link 
                                    href="/board/new?type=EVENT" 
                                    className="group relative px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Plus className="group-hover:rotate-90 transition-transform duration-300" size={20} />
                                    <span>Nuovo Evento</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </ScaleIn>

                {/* Events Grid */}
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.length === 0 ? (
                         <div className="col-span-full">
                            <FadeIn>
                                <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-dashed border-gray-300/50 shadow-sm">
                                    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                                        <CalendarIcon size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Nessun evento in programma</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        Sembra che non ci siano attività pianificate per i prossimi giorni. Goditi un po' di relax o proponi qualcosa tu!
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="h-full">
                                <EventCard event={event} />
                            </div>
                        ))
                    )}
                </StaggerContainer>
            </div>
        </div>
    );
}

