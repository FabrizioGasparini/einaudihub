import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

async function getSchoolAnnouncements() {
    return await prisma.announcement.findMany({
        where: { isOfficial: true },
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}


async function getClassAnnouncements(classId: string) {
    return await prisma.announcement.findMany({
        where: { classId: classId, isOfficial: false },
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}

export default async function AnnouncementsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    const schoolAnnouncements = await getSchoolAnnouncements();
    const classAnnouncements = user.classId ? await getClassAnnouncements(user.classId) : [];

    const canCreateSchool = userHasPermission(user, "CREATE_SCHOOL_ANNOUNCEMENT");
    const canCreateClass = userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT");
    const canCreate = canCreateSchool || canCreateClass;
    
    // Permission check for deletion logic is complex to duplicate here perfectly, 
    // but the button calls an action that checks permission again.
    // We can show the button safely if the user is likely to have permission.
    const canModeratePublic = userHasPermission(user, "MODERATE_PUBLIC_BOARD");
    const canModerateClass = userHasPermission(user, "MODERATE_CLASS_CONTENT");

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
                   <div className="flex justify-between items-center mb-8 px-4 md:px-0">
                <div>
                   <h1 className="text-3xl font-bold text-gray-900">Avvisi</h1>
                   <p className="text-gray-600">Comunicazioni ufficiali e di classe.</p>
                </div>
                {canCreate && (
                    <CreateAnnouncementModal 
                        canCreateSchool={canCreateSchool}
                        canCreateClass={canCreateClass}
                    />
                )}
            </div>

            <div className="space-y-12 px-4 md:px-0">
                
                {/* School Announcements */}
                <section>
                    <div className="flex items-center gap-2 mb-4 pl-2">
                        <Megaphone className="text-red-500" />
                        <h2 className="text-xl font-bold text-gray-800">Avvisi di Istituto</h2>
                    </div>
                    
                    {schoolAnnouncements.length === 0 ? (
                        <div className="p-8 bg-white rounded-3xl border border-dashed border-gray-300 text-center text-gray-400">
                             Nessun avviso ufficiale.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {schoolAnnouncements.map(ann => (
                                <AnnouncementCard 
                                    key={ann.id} 
                                    announcement={ann}
                                    currentUserId={user.id}
                                    canModeratePublic={canModeratePublic}
                                    canModerateClass={canModerateClass}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Class Announcements */}
                {user.classId && (
                     <section>
                        <div className="flex items-center gap-2 mb-4 pl-2">
                             <School className="text-yellow-600" />
                            <h2 className="text-xl font-bold text-gray-800">Avvisi Classe {user.className}</h2>
                        </div>
                        
                        {classAnnouncements.length === 0 ? (
                             <div className="p-8 bg-white rounded-3xl border border-dashed border-gray-300 text-center text-gray-400">
                                Nessun avviso per la tua classe.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {classAnnouncements.map(ann => (
                                    <AnnouncementCard 
                                        key={ann.id} 
                                        announcement={ann}
                                        currentUserId={user.id}
                                        canModeratePublic={canModeratePublic}
                                        canModerateClass={canModerateClass}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

