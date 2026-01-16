"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/authz";
import type { SessionUser } from "@/lib/types";
import { z } from "zod";
import { logAction } from "@/lib/logger";

// Schema validazione Post
const CreatePostSchema = z.object({
  title: z.string().min(5, "Il titolo deve essere di almeno 5 caratteri").max(100),
  content: z.string().min(10, "Il contenuto deve essere di almeno 10 caratteri"),
  categoryId: z.string().min(1, "Seleziona una categoria"),
  scope: z.enum(["GLOBAL", "CLASS"]), // Visibilità
});

// Schema validazione Commento
const CreateCommentSchema = z.object({
  content: z.string().min(1, "Il commento non può essere vuoto").max(500),
  postId: z.string(),
});

export async function createPost(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Devi essere loggato per pubblicare." };
  }
  const user = session.user as SessionUser;

  // 1. Controllo Permessi
  if (!userHasPermission(user, "CREATE_STUDENT_POST")) {
    return { error: "Non hai i permessi per creare post." };
  }

  // 2. Parsare dati
  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
    scope: formData.get("scope"),
  };

  const validated = CreatePostSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: (validated.error as any).errors?.[0]?.message || "Dati non validi" };
  }

  const { title, content, categoryId, scope: requestedScope } = validated.data;

  // 3. Enforce Scope Logic
  // Students and Class Reps can ONLY post to CLASS
  const hasGlobalPostRight = user.roles.some(r => 
      ['ADMIN', 'MODERATOR', 'SCHOOL_REP'].includes(r.role)
  );

  let finalScope = requestedScope;
  if (!hasGlobalPostRight && requestedScope === 'GLOBAL') {
      return { error: "Non hai i permessi per pubblicare nella bacheca d'istituto." };
  }

  let classId = null;
  if (finalScope === "CLASS") {
    if (!user.classId) {
      return { error: "Non sei associato ad alcuna classe." };
    }
    classId = user.classId;
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
        categoryId,
        classId, // null = Global
      },
    });

    await logAction("CREATE_POST", { postId: post.id, title, scope: finalScope }, user.id);
  } catch (e) {
    return { error: "Errore durante la creazione del post." };
  }

  revalidatePath("/board");
  return { success: true };
}

export async function createComment(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const user = session.user as SessionUser;

  // 1. Permessi
  if (!userHasPermission(user, "COMMENT")) {
    return { error: "Non puoi commentare." };
  }

  const rawData = {
    content: formData.get("content"),
    postId: formData.get("postId"),
  };

  const validated = CreateCommentSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: (validated.error as any).errors?.[0]?.message || "Dati non validi" };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: validated.data.content,
        postId: validated.data.postId,
        authorId: user.id,
      },
    });
    await logAction("CREATE_COMMENT", { commentId: comment.id, postId: validated.data.postId }, user.id);
  } catch (e) {
    return { error: "Impossibile salvare il commento." };
  }

  revalidatePath(`/board/${validated.data.postId}`);
  return { success: true };
}

export async function updatePost(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Login richiesto" };
  const user = session.user as SessionUser;

  const postId = formData.get("postId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!postId || !title || !content || !categoryId) {
      return { error: "Dati mancanti" };
  }

  const existingPost = await prisma.post.findUnique({ where: { id: postId } });
  if (!existingPost) return { error: "Post non trovato" };

  const isOwner = existingPost.authorId === user.id;
  const hasAdminPower = user.roles.some(r => r.role === 'ADMIN' || r.role === 'MODERATOR');

  if (!isOwner && !hasAdminPower) {
      return { error: "Non hai i permessi" };
  }

  try {
      await prisma.post.update({
          where: { id: postId },
          data: {
              title,
              content,
              categoryId
          }
      });
      await logAction("UPDATE_POST", { postId, title }, user.id);
      revalidatePath("/board");
      revalidatePath(`/board/${postId}`);
      return { success: true };
  } catch (e) {
      return { error: "Errore durante l'aggiornamento" };
  }
}

export async function deletePost(postId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Login richiesto" };
    const user = session.user as SessionUser;

    const existingPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!existingPost) return { error: "Post non trovato" };

    const isOwner = existingPost.authorId === user.id;
    
    // User requested strict ownership for deletion: 
    // "non posso cancellare nessun post se non è mio, anche se sono admin"
    if (!isOwner) {
        return { error: "Puoi cancellare solo i tuoi post." };
    }

    try {
        await prisma.post.delete({ where: { id: postId } });
        await logAction("DELETE_POST", { postId }, user.id);
        revalidatePath("/board");
        return { success: true };
    } catch (e) {
        return { error: "Errore durante l'eliminazione" };
    }
}
