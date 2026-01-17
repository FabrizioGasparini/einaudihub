"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SessionUser } from "@/lib/types";
import { z } from "zod";
import { userHasPermission } from "@/lib/authz";
import { logAction } from "@/lib/logger";

// --- JOIN EVENT ---

export async function joinEvent(eventId: string, participate: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Login richiesto" };
  const user = session.user as SessionUser;

  try {
    if (participate) {
        await prisma.eventParticipation.upsert({
            where: {
                userId_eventId: { userId: user.id, eventId: eventId }
            },
            create: {
                userId: user.id,
                eventId: eventId,
                status: "GOING"
            },
            update: {
                status: "GOING"
            }
        });
        await logAction("JOIN_EVENT", { eventId }, user.id);
    } else {
        await prisma.eventParticipation.deleteMany({
            where: {
                userId: user.id,
                eventId: eventId
            }
        });
        await logAction("LEAVE_EVENT", { eventId }, user.id);
    }
    
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Join Event Error:", error);
    return { error: "Errore durante l'operazione" };
  }
}

// --- CREATE EVENT ---

const CreateEventSchema = z.object({
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri"),
  description: z.string().min(10, "La descrizione deve essere più lunga"),
  date: z.string(), // ISO datetime string from input
  location: z.string().optional(),
  scope: z.enum(["GLOBAL", "CLASS"]),
});

export async function createEvent(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Login richiesto" };
  const user = session.user as SessionUser;

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    location: formData.get("location"),
    scope: formData.get("scope"),
  };

  const validated = CreateEventSchema.safeParse(rawData);
  
  if (!validated.success) {
    return { error: "Dati non validi", details: validated.error.flatten() };
  }

  const { title, description, date, location, scope } = validated.data;
  let classId: string | null = null;

  // Permissions Check
  if (scope === "GLOBAL") {
    if (!userHasPermission(user, "CREATE_SCHOOL_EVENT")) {
        return { error: "Non hai i permessi per creare eventi scolastici." };
    }
  } else {
    // Class Event
    if (!userHasPermission(user, "CREATE_CLASS_ANNOUNCEMENT")) { 
         return { error: "Non hai i permessi per creare eventi di classe." };
    }
    
    const targetClassId = formData.get("targetClassId") as string | null;
    const isAdmin = user.roles.some(r => r.role === 'ADMIN');
    if (targetClassId && isAdmin) {
        classId = targetClassId;
    } else {
        if (!user.classId) {
            return { error: "Non sei associato a nessuna classe." };
        }
        classId = user.classId;
    }
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location: location || "",
        classId: classId,
        createdById: user.id
      }
    });

    await logAction("CREATE_EVENT", { eventId: event.id, title, scope }, user.id);
    
    revalidatePath("/events");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Errore durante la creazione dell'evento." };
  }
}

export async function updateEvent(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Login richiesto" };
  const user = session.user as SessionUser;

  const eventId = formData.get("eventId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dateRaw = formData.get("date") as string;
  const location = formData.get("location") as string;

  if (!eventId || !title || !description || !dateRaw) {
      return { error: "Dati mancanti" };
  }

  const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existingEvent) return { error: "Evento non trovato" };

  const isOwner = existingEvent.createdById === user.id;
  const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

  if (!isOwner && !hasAdminPower) {
      return { error: "Non hai i permessi" };
  }

  try {
      await prisma.event.update({
          where: { id: eventId },
          data: {
              title, 
              description,
              date: new Date(dateRaw),
              location
          }
      });
      await logAction("UPDATE_EVENT", { eventId, title }, user.id);
      revalidatePath("/events");
      revalidatePath(`/events/${eventId}`);
      return { success: true };
  } catch (e) {
      return { error: "Errore durante l'aggiornamento" };
  }
}

export async function deleteEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Login richiesto" };
    const user = session.user as SessionUser;

    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) return { error: "Evento non trovato" };

    const isOwner = existingEvent.createdById === user.id;
    const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

    if (!isOwner && !hasAdminPower) {
        return { error: "Non hai i permessi" };
    }

    try {
        await prisma.event.delete({ where: { id: eventId } });
        await logAction("DELETE_EVENT", { eventId }, user.id);
        revalidatePath("/events");
        return { success: true };
    } catch (e) {
        return { error: "Errore durante l'eliminazione" };
    }
}
