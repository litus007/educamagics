// src/app/api/games/attempt/route.ts
// Registra un intent de joc i actualitza el rànquing global
// S'executa en background (fire-and-forget des del client)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

const AttemptSchema = z.object({
  activityId: z.string(),
  answer: z.string(),
  isCorrect: z.boolean(),
  timeSpentMs: z.number().int().positive(),
  pointsEarned: z.number().int().min(0),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = AttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dades incorrectes" }, { status: 400 });
  }

  const data = parsed.data;
  const userId = session.user.id;

  try {
    // Forcem a tipus 'any' temporalment per esquivar les restriccions ràpides de l'editor de codi
    const txDb = db as any;

    await db.$transaction(async (tx: any) => {
      
      // 1. Guardem l'intent del joc utilitzant el model en minúscula del client de prisma
      await tx.attempt.create({
        data: {
          activityId: data.activityId,
          userId: userId,
          answer: data.answer,
          isCorrect: data.isCorrect,
          timeSpentMs: data.timeSpentMs,
          pointsEarned: data.pointsEarned,
        },
      });

      // Si la resposta és correcta, actualitzem els rànquings i el perfil
      if (data.isCorrect) {
        // Busquem el perfil del nen
        const profile = await tx.childProfile.findUnique({
          where: { userId },
        });

        const displayName = session.user.name || "Estudiant de Màgia";
        const avatarKey = profile?.avatarKey || "star";

        // 2. Actualitzem el Rànquing Global
        await tx.globalRanking.upsert({
          where: { userId },
          create: {
            userId,
            displayName,
            avatarKey,
            totalPoints: data.pointsEarned,
            totalCorrect: 1,
            totalAttempts: 1,
            currentStreak: 1,
            longestStreak: 1,
            weeklyPoints: data.pointsEarned,
          },
          update: {
            totalPoints: { increment: data.pointsEarned },
            totalCorrect: { increment: 1 },
            totalAttempts: { increment: 1 },
            weeklyPoints: { increment: data.pointsEarned },
            lastPlayedAt: new Date(),
          },
        });

        // 3. Sumem els punts directament al seu perfil de gamificació
        await tx.childProfile.update({
          where: { userId },
          data: { points: { increment: data.pointsEarned } },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en registrar l'intent:", error);
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}