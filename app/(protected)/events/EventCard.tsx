import Link from 'next/link';
import { Calendar as CalendarIcon, MapPin, Users } from "lucide-react";

interface EventCardProps {
    event: {
        id: string;
        title: string;
        date: Date;
        location: string | null;
        classId: string | null;
        _count?: {
            participations: number;
        };
    };
}

export default function EventCard({ event }: EventCardProps) {
    const getMonth = (date: Date) => date.toLocaleString('it-IT', { month: 'short' }).toUpperCase();
    const getDay = (date: Date) => date.getDate();

    return (
        <Link href={`/events/${event.id}`} className="group bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            {/* Fake Image Placeholder with Random Gradient */}
            <div className={`h-32 w-full bg-gradient-to-r from-blue-400 to-indigo-500 relative`}>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-xl p-2 text-center min-w-[60px] shadow-sm">
                    <span className="block text-xs font-bold text-red-500 uppercase">{getMonth(event.date)}</span>
                    <span className="block text-2xl font-black text-gray-900 leading-none">{getDay(event.date)}</span>
                </div>
                {event.classId && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-bold">
                        Solo {event.classId}
                    </div>
                )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.title}
                </h3>
                
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-blue-500" />
                        <span>
                            {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />
                        <span className="truncate">{event.location || "Nessun luogo specificato"}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{event._count?.participations || 0} partecipanti</span>
                    </div>
                    <span className="font-medium text-blue-600 group-hover:underline">Dettagli →</span>
                </div>
            </div>
        </Link>
    );
}
