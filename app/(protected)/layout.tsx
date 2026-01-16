import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { Menu } from "lucide-react";
import type { SessionUser } from "@/lib/types";

// Components
import Sidebar from "@/components/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as SessionUser;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header - Keeping it simple for now, Sidebar is desktop based */}
      <div className="md:hidden bg-white/80 backdrop-blur-md px-4 py-3 border-b flex justify-between items-center sticky top-0 z-50">
        <span className="font-extrabold text-xl text-gray-900 tracking-tight">
          Einaudi<span className="text-blue-600">HUB</span>
        </span>
        <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
           <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* New Interactive Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full md:w-auto">
        <div className="max-w-5xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
}
