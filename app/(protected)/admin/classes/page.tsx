import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
import AdminClassesManager from "./AdminClassesManager";

export default async function AdminClassesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    const user = session.user as SessionUser;

    if (!isAdmin(user)) redirect("/home");

    const classes = await prisma.class.findMany({
        include: {
            _count: { select: { students: true } }
        },
        orderBy: [{ year: 'asc' }, { section: 'asc' }]
    });

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestione Classi</h1>
                    <p className="text-gray-600">Configura le sezioni e le classi dell'istituto.</p>
                </div>
                <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="inline w-4 h-4 mr-1" /> Indietro
                </Link>
            </header>

            <AdminClassesManager classes={classes} />
        </div>
    );
}
