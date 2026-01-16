import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Plus, MapPin, Calendar as CalendarIcon, Users } from "lucide-react";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import EventCard from "./EventCard";

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
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 px-4 md:px-0">
                <div>
                   <h1 className="text-3xl font-bold text-gray-900">Eventi</h1>
                   <p className="text-gray-600">Non perderti nulla di ciò che accade.</p>
                </div>
                {canCreate && (
                    <Link href="/events/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center gap-2">
                        <Plus size={20} />
                        <span className="hidden md:inline">Crea Evento</span>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
                {events.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nessun evento in programma</h3>
                        <p className="text-gray-500">Goditi il tempo libero!</p>
                    </div>
                ) : (
                    events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))
                )}
            </div>
        </div>
    );
}

