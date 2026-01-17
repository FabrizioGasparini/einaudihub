import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import type { SessionUser } from "@/lib/types";

// Components
import ClientLayout from "@/components/ClientLayout";

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
    <ClientLayout user={user}>
      {children}
    </ClientLayout>
  );
}
