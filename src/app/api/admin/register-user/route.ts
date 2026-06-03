// src/app/api/admin/register-user/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs"; 

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Seguretat: Només l'administrador pot fer peticions aquí
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!email || !password || !role || !name) {
      return NextResponse.json({ error: "Falten camps obligatoris" }, { status: 400 });
    }

    // Comprovar si l'usuari ja existeix
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Aquest correu ja està registrat" }, { status: 400 });
    }

    // Encriptem la contrasenya temporal enviada per l'admin
    const hashedPassword = await bcrypt.hash(password, 10);

    // Executem la transacció forçant el client a 'any' per evitar conflictes visuals de tipus
    await (db as any).$transaction(async (tx: any) => {
      // 1. Creem l'usuari base
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          role,
        },
      });

      // Asegurem que obtenim la ID com a text sense importar el retard del linter
      const newUserId = String(newUser.id);

      // 2. Creació del perfil segons el rol triat (sempre usant el model en minúscules pel client de Prisma)
      if (role === "PARENT") {
        await tx.parentProfile.create({
          data: { userId: newUserId },
        });
      } else if (role === "TEACHER") {
        await tx.teacherProfile.create({
          data: { 
            userId: newUserId,
            rating: 5.0,
            ratingCount: 0 
          },
        });
      } else if (role === "CHILD") {
        const { parentId } = body;
        const profile = await tx.childProfile.create({
    data: { userId: newUserId, pinHash: "PENDING_PASSWORD", points: 0 } 
  });
        await tx.child.create({
          data: { 
            userId: newUserId,
            parentId: parentId,
            childProfileId: profile.id,
            points: 0,
            avatarKey: "star"
          },
        });
        
        // Inicialitzem també el seu lloc al Rànquing Global en minúscula (tx.globalRanking)
        await tx.globalRanking.create({
          data: {
            userId: newUserId,
            displayName: name,
            avatarKey: "star",
            totalPoints: 0,
            totalCorrect: 0,
            totalAttempts: 0,
            currentStreak: 0,
            longestStreak: 0,
            weeklyPoints: 0,
          }
        });
      }
    });

    return NextResponse.json({ ok: true, message: `Usuari amb rol ${role} creat correctament` });

  } catch (error: any) {
    console.error("Error en el registre d'usuari:", error);
    return NextResponse.json({ error: "Error intern en crear l'usuari" }, { status: 500 });
  }
}