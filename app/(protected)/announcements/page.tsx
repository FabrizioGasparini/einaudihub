import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Megaphone, School, Sparkles, Bell, Plus } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import { FadeIn, ScaleIn, SlideIn, StaggerContainer } from "@/components/MotionWrappers";

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
    
    const canModeratePublic = userHasPermission(user, "MODERATE_PUBLIC_BOARD");
    const canModerateClass = userHasPermission(user, "MODERATE_CLASS_CONTENT");

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden p-6 pb-24">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] right-[30%] w-96 h-96 bg-red-300/20 rounded-full blur-[100px] animate-blob mix-blend-multiply filter"></div>
                <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-orange-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
                <div className="absolute top-[40%] right-[10%] w-80 h-80 bg-yellow-200/20 rounded-full blur-[80px] animate-blob animation-delay-4000 mix-blend-multiply filter"></div>
            </div>

            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header */}
                 <ScaleIn>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-indigo-900 shadow-2xl p-8 text-white">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Megaphone size={180} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                        <Bell className="text-indigo-300" size={20} />
                                    </div>
                                    <span className="text-indigo-200 font-mono tracking-widest uppercase text-xs">Comunicazioni</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tight mb-2 text-white">
                                    Avvisi & Circolari
                                </h1>
                                <p className="text-indigo-200 text-lg max-w-xl font-light">
                                    Tutte le comunicazioni ufficiali e di classe in un unico posto.
                                </p>
                            </div>
                            
                            {canCreate && (
                                <Link 
                                    href="/board/new?type=ANNOUNCEMENT" 
                                    className="group relative px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Plus className="group-hover:rotate-90 transition-transform duration-300" size={20} />
                                    <span>Nuovo Avviso</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </ScaleIn>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* School Announcements */}
                    <div className="space-y-6">
                        <SlideIn direction="left">
                            <div className="flex items-center gap-3 pl-2">
                                <div className="bg-red-100 p-2.5 rounded-xl text-red-600">
                                    <Megaphone size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Avvisi di Istituto</h2>
                            </div>
                        </SlideIn>
                        
                        <StaggerContainer className="space-y-4">
                            {schoolAnnouncements.length === 0 ? (
                                <FadeIn>
                                    <div className="p-8 bg-white/60 backdrop-blur-md rounded-3xl border border-dashed border-red-200 text-center text-gray-400 shadow-sm">
                                         <p>Nessun avviso ufficiale al momento.</p>
                                    </div>
                                </FadeIn>
                            ) : (
                                schoolAnnouncements.map(ann => (
                                    <AnnouncementCard 
                                        key={ann.id} 
                                        announcement={ann}
                                        currentUserId={user.id}
                                        canModeratePublic={canModeratePublic}
                                        canModerateClass={canModerateClass}
                                    />
                                ))
                            )}
                        </StaggerContainer>
                    </div>

                    {/* Class Announcements */}
                    {user.classId && (
                         <div className="space-y-6">
                            <SlideIn direction="right">
                                <div className="flex items-center gap-3 pl-2">
                                    <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600">
                                        <School size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Classe {user.className}</h2>
                                </div>
                            </SlideIn>
                            
                            <StaggerContainer className="space-y-4">
                                {classAnnouncements.length === 0 ? (
                                     <FadeIn>
                                        <div className="p-8 bg-white/60 backdrop-blur-md rounded-3xl border border-dashed border-yellow-200 text-center text-gray-400 shadow-sm">
                                            <p>Tutto tranquillo in classe.</p>
                                        </div>
                                    </FadeIn>
                                ) : (
                                    classAnnouncements.map(ann => (
                                        <AnnouncementCard 
                                            key={ann.id} 
                                            announcement={ann}
                                            currentUserId={user.id}
                                            canModeratePublic={canModeratePublic}
                                            canModerateClass={canModerateClass}
                                        />
                                    ))
                                )}
                            </StaggerContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

