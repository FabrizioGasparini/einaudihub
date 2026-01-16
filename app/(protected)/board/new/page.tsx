import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import { CreatePostForm } from "./create-post-form";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  if (!userHasPermission(user, "CREATE_STUDENT_POST")) {
    return (
        <div className="text-center py-10">
            <h1 className="text-red-600 font-bold">Non autorizzato</h1>
            <p>Non hai il permesso di creare nuovi post.</p>
        </div>
    );
  }

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Post</h1>
        <p className="text-gray-600">Condividi qualcosa con la scuola o la tua classe.</p>
      </header>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
         <CreatePostForm categories={categories} user={user} />
      </div>
    </div>
  );
}

