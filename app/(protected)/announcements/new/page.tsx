import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/authz";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateAnnouncementForm from "./CreateAnnouncementForm";
import type { SessionUser } from "@/lib/types";

export default async function NewAnnouncementPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    const canCreateSchool = userHasPermission(user, "CREATE_SCHOOL_ANNOUNCEMENT");
    const canCreateClass = userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT");

    if (!canCreateSchool && !canCreateClass) {
         redirect("/announcements");
    }

    return (
        <div className="max-w-2xl mx-auto pb-20 pt-8 px-4">
             <div className="mb-8">
                <Link href="/announcements" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4">
                    <ArrowLeft size={20} className="mr-1" />
                    Annulla
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900">Nuovo Avviso</h1>
                <p className="text-gray-600 mt-2">Pubblica una comunicazione importante.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                <CreateAnnouncementForm 
                    canCreateSchool={canCreateSchool}
                    canCreateClass={canCreateClass}
                />
            </div>
        </div>
    );
}