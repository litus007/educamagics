import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // Fes servir l'import específic de next/next
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) { // Canvia a POST si DELETE et dona problemes amb el client
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Falta el userId" }, { status: 400 });
    }

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en l'API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}