import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Megaphone, MessageSquare, School } from "lucide-react";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";

interface AnnouncementCardProps {
    announcement: {
        id: string;
        title: string;
        content: string;
        isOfficial: boolean;
        classId: string | null;
        createdAt: Date;
        createdBy: {
            name: string;
        };
        createdById: string;
    };
    currentUserId?: string;
    canModeratePublic?: boolean;
    canModerateClass?: boolean;
    className?: string;
}

export default function AnnouncementCard({ 
    announcement, 
    currentUserId, 
    canModeratePublic = false, 
    canModerateClass = false,
    className
}: AnnouncementCardProps) {
    
    // Permission check
    let canDelete = false;
    if (currentUserId && announcement.createdById === currentUserId) {
        canDelete = true;
    } else if (announcement.isOfficial) {
        if (canModeratePublic) canDelete = true;
    } else if (announcement.classId) {
        if (canModerateClass) canDelete = true;
    }

    const isOfficial = announcement.isOfficial;

    return (
        <div className={`
            relative p-6 rounded-3xl shadow-sm border mb-4 transition-all hover:shadow-md
            ${isOfficial 
                ? 'bg-red-50 border-red-100' 
                : 'bg-yellow-50 border-yellow-100'}
            ${className || ''}
        `}>
            {/* Header / Badge */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`
                        p-2 rounded-xl text-white shadow-sm
                        ${isOfficial ? 'bg-red-500' : 'bg-yellow-500 text-yellow-900'}
                    `}>
                        {isOfficial ? <Megaphone size={20} /> : <MessageSquare size={20} />}
                    </div>
                    <div>
                        <div className={`
                            text-xs font-bold uppercase tracking-wider mb-0.5
                            ${isOfficial ? 'text-red-600' : 'text-yellow-700'}
                        `}>
                            {isOfficial ? 'Avviso Istituzionale' : 'Avviso di Classe'}
                        </div>
                        <div className="text-xs text-gray-500 font-medium opacity-80">
                            {format(announcement.createdAt, "d MMM, HH:mm", { locale: it })}
                            <span className="mx-1">•</span>
                            {announcement.createdBy.name}
                        </div>
                    </div>
                </div>
                
                {canDelete && (
                    <div className="opacity-50 hover:opacity-100 transition-opacity">
                         <DeleteAnnouncementButton id={announcement.id} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="pl-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {announcement.title}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {announcement.content}
                </p>
            </div>
        </div>
    );
}
