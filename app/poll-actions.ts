"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SessionUser } from "@/lib/types";
import { z } from "zod";
import { userHasPermission } from "@/lib/authz";
import { logAction } from "@/lib/logger";

const CreatePollSchema = z.object({
  question: z.string().min(5, "La domanda deve essere lunga almeno 5 caratteri"),
  options: z.array(z.string().min(1, "L'opzione non può essere vuota")).min(2, "Inserisci almeno 2 opzioni"),
  scope: z.enum(["SCHOOL", "CLASS"]),
  endsAt: z.string().optional(), // ISO String
});

export async function createPoll(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Login richiesto" };
  const user = session.user as SessionUser;

  // Extract options from FormData (expecting 'options[]' or separate fields processed in client)
  // Simple approach: we'll JSON.parse a hidden field called 'optionsJson' to handle dynamic array
  // OR we can iterate keys. Let's assume the client sends a JSON string for options to make it cleaner.
  
  const rawOptions = formData.get("options");
  const optionsArray = rawOptions ? JSON.parse(rawOptions.toString()) : [];

  const rawData = {
    question: formData.get("question"),
    options: optionsArray,
    scope: formData.get("scope"),
    endsAt: formData.get("endsAt") || undefined,
  };

  const validated = CreatePollSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Dati non validi", details: validated.error.flatten() };
  }

  const { question, options, scope, endsAt } = validated.data;
  let schoolWide = false;
  let classId: string | null = null;

  // PERMISSION CHECK
  if (scope === "SCHOOL") {
    if (!userHasPermission(user, "CREATE_GLOBAL_POLL")) {
        return { error: "Non hai i permessi per creare sondaggi globali." };
    }
    schoolWide = true;
  } else if (scope === "CLASS") {
     if (!userHasPermission(user, "CREATE_CLASS_POLL")) {
        return { error: "Non hai i permessi per creare sondaggi di classe." };
     }
     
     const targetClassId = formData.get("targetClassId") as string | null;
     const isAdmin = user.roles.some(r => r.role === 'ADMIN');
     if (targetClassId && isAdmin) {
         // Admin creating for another class
         classId = targetClassId;
     } else {
         if (!user.classId) return { error: "Non fai parte di una classe." };
         classId = user.classId;
     }
  }

  try {
    const poll = await prisma.poll.create({
      data: {
        question,
        schoolWide,
        classId,
        createdById: user.id,
        endsAt: endsAt ? new Date(endsAt) : null,
        options: {
            create: options.map(opt => ({ text: opt }))
        }
      }
    });

    await logAction("CREATE_POLL", { pollId: poll.id, question, scope }, user.id);

    revalidatePath("/polls");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Errore durante la creazione del sondaggio." };
  }
}

export async function votePoll(pollId: string, optionId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Login richiesto" };
    const user = session.user as SessionUser;

    // 1. Check Poll existence and access
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return { error: "Sondaggio non trovato" };

    if (poll.classId && poll.classId !== user.classId) {
        return { error: "Non puoi votare in questo sondaggio (classe diversa)" };
    }

    if (poll.endsAt && new Date() > poll.endsAt) {
        return { error: "Il sondaggio è scaduto" };
    }

    // 2. Register or Update vote
    try {
        await prisma.pollVote.upsert({
            where: {
                pollId_userId: {
                    pollId: pollId,
                    userId: user.id
                }
            },
            update: {
                optionId: optionId
            },
            create: {
                pollId: pollId,
                optionId: optionId,
                userId: user.id
            }
        });
        await logAction("VOTE_POLL", { pollId, optionId }, user.id);
        revalidatePath("/polls");
        return { success: true };
    } catch (e) {
        return { error: "Errore nel salvataggio del voto" };
    }
}

export async function updatePoll(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Login richiesto" };
  const user = session.user as SessionUser;

  const pollId = formData.get("pollId") as string;
  if (!pollId) return { error: "ID Sondaggio mancante" };

  const question = formData.get("question") as string;
  const endsAtRaw = formData.get("endsAt") as string;

  if (!question || question.length < 5) return { error: "La domanda è troppo corta" };
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : null;

  const existingPoll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!existingPoll) return { error: "Sondaggio non trovato" };

  // Check permissions: Owner or Admin/Moderator
  const isOwner = existingPoll.createdById === user.id;
  const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

  if (!isOwner && !hasAdminPower) {
      return { error: "Non hai i permessi per modificare questo sondaggio" };
  }

  try {
      await prisma.poll.update({
          where: { id: pollId },
          data: {
              question,
              endsAt
          }
      });
      await logAction("UPDATE_POLL", { pollId }, user.id);
      revalidatePath("/polls");
      return { success: true };
  } catch (e) {
      return { error: "Errore durante l'aggiornamento" };
  }
}

export async function deletePoll(pollId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Login richiesto" };
    const user = session.user as SessionUser;

    const existingPoll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!existingPoll) return { error: "Sondaggio non trovato" };

    const isOwner = existingPoll.createdById === user.id;
    const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

    if (!isOwner && !hasAdminPower) {
        return { error: "Non hai i permessi per eliminare questo sondaggio" };
    }

    try {
        await prisma.poll.delete({ where: { id: pollId } });
        await logAction("DELETE_POLL", { pollId }, user.id);
        revalidatePath("/polls");
        return { success: true };
    } catch(e) {
        return { error: "Errore durante l'eliminazione" };
    }
}