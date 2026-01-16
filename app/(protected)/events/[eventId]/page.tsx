import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { MapPin, Calendar, Clock, User, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import EventParticipationButton from "./EventParticipationButton";
import EventActions from "./EventActions";
import type { SessionUser } from "@/lib/types";

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            createdBy: {
                select: { name: true }
            },
            participations: {
                where: { userId: user.id }
            },
            _count: {
                select: { participations: true }
            }
        }
    });

    if (!event) notFound();

    // Access control
    if (event.classId && event.classId !== user.classId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Accesso Negato</h2>
                <p className="text-gray-600">Questo evento è riservato a un'altra classe.</p>
                <Link href="/events" className="mt-4 text-blue-600 hover:underline">Torna agli eventi</Link>
            </div>
        );
    }

    const isParticipating = event.participations.length > 0;
    
    // Permission Check
    const isOwner = event.createdById === user.id;
    const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');
    const canManage = isOwner || hasAdminPower;

    // Visibility Check for Participants List
    let canViewParticipants = canManage;
    
    // School Reps always see participants
    if (user.roles.some(r => r.role === 'SCHOOL_REP')) {
        canViewParticipants = true;
    }

    // Class Rep check (only if matching class)
    if (event.classId) {
         if (user.roles.some(r => r.role === 'CLASS_REP' && r.classId === event.classId)) {
             canViewParticipants = true;
         }
    }

    let participantsList: any[] = [];
    if (canViewParticipants) {
        participantsList = await prisma.eventParticipation.findMany({
            where: { eventId: event.id },
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Back Link */}
            <div className="mb-6 px-4 md:px-0">
                <Link href="/events" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} className="mr-1" />
                    Torna alla lista
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                {/* Hero / Cover */}
                <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative flex items-end p-6 md:p-10">
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-white text-xs font-bold border border-white/20">
                            {event.classId ? `Classe ${event.classId}` : "Istituto"}
                        </div>
                        {canManage && <EventActions eventId={event.id} />}
                    </div>
                </div>

                <div className="px-6 md:px-10 py-8">
                    {/* Title & Meta */}
                    <div className="mb-8">
                         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                            {event.title}
                        </h1>
                        
                        <div className="flex flex-wrap gap-4 md:gap-8 text-gray-600">
                             <div className="flex items-center gap-2">
                                <Calendar className="text-blue-500" />
                                <span className="font-medium text-lg capitalize">
                                    {format(event.date, "EEEE d MMMM yyyy", { locale: it })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="text-blue-500" />
                                <span className="font-medium text-lg">
                                    {format(event.date, "HH:mm")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 my-8" />

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            {/* Description */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Dettagli</h3>
                                <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            </section>

                            {/* Location */}
                             {event.location && (
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Luogo</h3>
                                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <MapPin className="text-red-500 mt-1" />
                                        <span className="font-medium text-gray-900">{event.location}</span>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                             {/* Organizer */}
                             <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Organizzato da</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                        {event.createdBy.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{event.createdBy.name}</div>
                                        <div className="text-xs text-gray-500">Rappresentante</div>
                                    </div>
                                </div>
                            </div>

                            {/* Participants Stat */}
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="text-blue-600" />
                                    <span className="font-bold text-gray-900 text-lg">{event._count.participations}</span>
                                </div>
                                <div className="text-sm text-gray-600">Studenti partecipano</div>
                            </div>

                            {/* Action Button */}
                            <div className="sticky bottom-4 md:static">
                                <div className="md:hidden absolute inset-0 -z-10 bg-gradient-to-t from-white via-white to-transparent h-24 -top-24" />
                                <EventParticipationButton 
                                    eventId={event.id} 
                                    isParticipating={isParticipating} 
                                />
                            </div>

                            {/* Participants List (Privileged) */}
                            {canViewParticipants && participantsList.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mt-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Partecipanti ({participantsList.length})</h3>
                                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {participantsList.map(p => (
                                            <div key={p.user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {p.user.avatarUrl ? (
                                                        <img src={p.user.avatarUrl} alt={p.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">{p.user.name[0]}</div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate">{p.user.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

