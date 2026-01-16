"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SessionUser } from "@/lib/types";
import { z } from "zod";
import { userHasPermission } from "@/lib/authz";
import { logAction } from "@/lib/logger";

const CreateAnnouncementSchema = z.object({
  title: z.string().min(5, "Il titolo deve essere almeno di 5 caratteri"),
  content: z.string().min(10, "Il contenuto deve essere almeno di 10 caratteri"),
  scope: z.enum(["SCHOOL", "CLASS"]), 
});

export async function createAnnouncement(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Login richiesto" };
  const user = session.user as SessionUser;

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    scope: formData.get("scope"),
  };

  const validated = CreateAnnouncementSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Dati non validi", details: validated.error.flatten() };
  }

  const { title, content, scope } = validated.data;
  let isOfficial = false;
  let classId: string | null = null;

  // VERIFICA PERMESSI
  if (scope === "SCHOOL") {
    if (!userHasPermission(user, "CREATE_SCHOOL_ANNOUNCEMENT")) {
      return { error: "Non hai i permessi per creare avvisi di istituto." };
    }
    isOfficial = true;
  } else if (scope === "CLASS") {
     if (!userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT")) {
      return { error: "Non hai i permessi per creare avvisi per la tua classe." };
     }
     if (!user.classId) {
       return { error: "Non fai parte di alcuna classe." };
     }
     classId = user.classId;
  } else {
    return { error: "Ambito non valido." };
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        isOfficial,
        classId,
        createdById: user.id
      }
    });

    await logAction("CREATE_ANNOUNCEMENT", { announcementId: announcement.id, title, scope }, user.id);

    revalidatePath("/announcements");
    return { success: true };
  } catch (error) {
    console.error("Create Announcement Error:", error);
    return { error: "Errore durante la creazione dell'avviso." };
  }
}

export async function deleteAnnouncement(announcementId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Login richiesto" };
    const user = session.user as SessionUser;

    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId }
    });

    if (!announcement) return { error: "Avviso non trovato" };

    // Check permissions
    const canModeratePublic = userHasPermission(user, "MODERATE_PUBLIC_BOARD"); // Broad moderation
    const canModerateClass = userHasPermission(user, "MODERATE_CLASS_CONTENT");
    
    let canDelete = false;

    if (announcement.createdById === user.id) {
        canDelete = true; // Author can always delete
    } else if (announcement.isOfficial) {
        if (canModeratePublic) canDelete = true;
    } else if (announcement.classId) {
        if (canModerateClass && announcement.classId === user.classId) canDelete = true;
    }

    if (!canDelete) return { error: "Non hai i permessi per eliminare questo avviso." };

    try {
        await prisma.announcement.delete({ where: { id: announcementId } });
        await logAction("DELETE_ANNOUNCEMENT", { announcementId }, user.id);
        revalidatePath("/announcements");
        return { success: true };
    } catch (e) {
        return { error: "Errore durante l'eliminazione" };
    }
}