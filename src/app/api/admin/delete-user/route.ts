import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Validació de seguretat
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Falta el userId" }, { status: 400 });
    }

    // 2. Esborrat: Com que tens 'onDelete: Cascade' a tot el teu schema.prisma,
    // esborrar l'usuari eliminarà automàticament els seus perfils, sessions, 
    // reserves, etc.
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error esborrant usuari:", error);
    return NextResponse.json({ error: "No s'ha pogut esborrar l'usuari" }, { status: 500 });
  }
}