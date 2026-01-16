import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth"; // Added this
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import path from "path";
import { RoleName } from "@prisma/client";

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "token.json"),
  scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
  clientOptions: {
    subject: "administrator@einaudicorreggio.it",
  },
});

const service = google.admin({ version: "directory_v1", auth });

/**
 * Helper per parsare la classe da orgUnitPath (es. "/Studenti/5A" -> { year: 5, section: "A" })
 */
function parseClassFromOrgUnit(orgUnitPath: string): { year: number; section: string } | null {
  const parts = orgUnitPath.split("/");
  if (parts.length < 3) return null;
  
  const classStr = parts[2]; // es. "5A", "3B INF"
  // Estrai l'anno (primo numero) e la sezione (resto)
  const match = classStr.match(/^(\d+)(.+)$/);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const section = match[2].trim();
  
  return { year, section };
}

/**
 * Trova o crea una Class nel database
 */
async function findOrCreateClass(year: number, section: string) {
  let classRecord = await prisma.class.findUnique({
    where: { year_section: { year, section } },
  });
  
  if (!classRecord) {
    classRecord = await prisma.class.create({
      data: { year, section },
    });
  }
  
  return classRecord;
}

/**
 * Crea o aggiorna UserRole per un utente
 */
async function ensureUserRole(
  userId: string,
  role: RoleName,
  options?: { classId?: string; schoolWide?: boolean }
) {
  const existing = await prisma.userRole.findFirst({
    where: {
      userId,
      role,
      classId: options?.classId || null,
      schoolWide: options?.schoolWide || false,
    },
  });
  
  if (!existing) {
    await prisma.userRole.create({
      data: {
        userId,
        role,
        classId: options?.classId || null,
        schoolWide: options?.schoolWide || false,
      },
    });
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // DEV ONLY: Login simulato per testare vari ruoli
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            name: "Dev User",
            credentials: {
              email: { label: "Email", type: "text" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              const user = await prisma.user.findUnique({
                where: { email: credentials.email },
              });
              return user; // Se l'utente esiste nel DB, loggalo senza password
            },
          }),
        ]
      : []),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
          hd: "einaudicorreggio.it",
        },
      },
    }),
    CredentialsProvider({
      name: "Secret Access",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.password === "rappseinaudi2526!") {
          return {
            id: "admin-bypass",
            name: "Admin Bypass",
            email: "rappresentanti@einaudicorreggio.it",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Bypass per credentials provider
      if (account?.provider === "credentials") {
        const email = user.email!;
        let dbUser = await prisma.user.findUnique({ where: { email } });
        
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              name: user.name || "Admin",
            },
          });
          
          // Crea ruolo ADMIN con schoolWide=true
          await ensureUserRole(dbUser.id, RoleName.ADMIN, { schoolWide: true });
        } else {
          // Assicurati che abbia il ruolo ADMIN
          await ensureUserRole(dbUser.id, RoleName.ADMIN, { schoolWide: true });
        }
        
        return true;
      }

      if (!account || !profile || !profile.email) return false;

      // Restrict to domain
      if (!profile.email.endsWith("@einaudicorreggio.it")) {
        return false;
      }

      let classRecord = null;
      let classInfo: { year: number; section: string } | null = null;

      try {
        const userData = await service.users.get({ userKey: profile.email });
        if (userData.data.orgUnitPath) {
          console.log("OrgUnitPath:", userData.data.orgUnitPath);
          classInfo = parseClassFromOrgUnit(userData.data.orgUnitPath);
          
          if (classInfo) {
            classRecord = await findOrCreateClass(classInfo.year, classInfo.section);
          }
        }
      } catch (error) {
        console.error("Error fetching user data from Google Admin SDK:", error);
        // Continua anche se Admin SDK fallisce (potrebbe essere admin/docente senza classe)
      }

      const isAdminEmail =
        profile.email === "gasparini.fabrizio@einaudicorreggio.it" ||
        profile.email === "busato.riccardo@einaudicorreggio.it";

      let dbUser = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!dbUser) {
        // Crea nuovo utente
        dbUser = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name || "",
            classId: classRecord?.id || null,
          },
        });

        // Crea ruolo: ADMIN se email match, altrimenti STUDENT
        if (isAdminEmail) {
          await ensureUserRole(dbUser.id, RoleName.ADMIN, { schoolWide: true });
        } else {
          await ensureUserRole(dbUser.id, RoleName.STUDENT);
        }
      } else {
        // Aggiorna utente esistente
        const updateData: { classId?: string } = {};
        
        if (classRecord && dbUser.classId !== classRecord.id) {
          updateData.classId = classRecord.id;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: updateData,
          });
        }

        // Auto-promote a ADMIN se email match
        if (isAdminEmail) {
          await ensureUserRole(dbUser.id, RoleName.ADMIN, { schoolWide: true });
        } else {
          // Assicurati che abbia almeno STUDENT
          await ensureUserRole(dbUser.id, RoleName.STUDENT);
        }
      }

      return true;
    },
    async session({ session }: any) {
      if (!session?.user?.email) return session;

      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { roles: true, class: true },
      });

      if (!dbUser) return session;

      (session.user as any).id = dbUser.id;
      (session.user as any).classId = dbUser.classId;
      (session.user as any).className = dbUser.class ? `${dbUser.class.year}${dbUser.class.section}` : null;
      (session.user as any).roles = dbUser.roles.map((r) => ({
        role: r.role,
        classId: r.classId,
        schoolWide: r.schoolWide,
      }));

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};
