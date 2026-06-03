import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();
  
  // 1. Validar si és admin
  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "No autoritzat" }, { status: 401 });

  // 2. Generar codi de 6 dígits
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 3. Guardar a DB
  await db.user.update({
    where: { email },
    data: { tempCode: code, codeExpires: new Date(Date.now() + 5 * 60000) } // 5 minuts
  });

  // 4. Enviar correu
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "🔐 Codi d'accés Administrador",
    html: `<p>El teu codi d'accés és: <strong>${code}</strong>. Caduca en 5 minuts.</p>`
  });

  return NextResponse.json({ success: true });
}