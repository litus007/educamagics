// src/app/api/webhooks/send-notifications/route.ts
// Processa notificacions pendents de forma síncrona.
// Substitueix BullMQ al MVP.
// 
// Opcions per invocar-la al free tier (sense cua):
// A) Cridar-la directament des de les mutations tRPC (síncron)
// B) Supabase pg_cron (1 job gratuït): cada 5 min executa
//    SELECT net.http_post(url => 'https://app.com/api/webhooks/send-notifications', ...)
// C) Vercel Cron Jobs (free tier: 1 cron/dia)
//
// Autenticació: secret compartit a la capçalera X-Webhook-Secret

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // Valida el secret per evitar cridades no autoritzades
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Agafa les notificacions pendents en lots de 10
  const pending = await db.notification.findMany({
    where: { status: "PENDING", channel: "EMAIL" },
    take: 10,
    orderBy: { createdAt: "asc" },
    include: {
      booking: {
        include: {
          child: true,
          timeSlot: { include: { teacher: { include: { user: true } } } },
        },
      },
    },
  });

  const results = await Promise.allSettled(
    pending.map(async (notification) => {
      const toUser = await db.user.findUnique({
        where: { id: notification.toUserId },
        select: { email: true, name: true },
      });

      if (!toUser?.email) throw new Error("No email");

      const { subject, html } = buildEmailContent(notification.type, {
        ...(notification.payload as object),
        userName: toUser.name,
      });

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: toUser.email,
        subject,
        html,
      });

      await db.notification.update({
        where: { id: notification.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  // Marca les fallides
  if (failed > 0) {
    const failedIds = pending
      .filter((_, i) => results[i].status === "rejected")
      .map((n) => n.id);

    await db.notification.updateMany({
      where: { id: { in: failedIds } },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ sent, failed });
}

// ── Templates d'email per tipus ──

type EmailContent = { subject: string; html: string };

function buildEmailContent(
  type: string,
  payload: Record<string, any>
): EmailContent {
  const base = `style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px"`;

  switch (type) {
    case "BOOKING_REQUEST":
      return {
        subject: "📚 Nova sol·licitud de classe — Educamagics",
        html: `<div ${base}>
          <h2>Hola ${payload.teacherName},</h2>
          <p>Tens una nova sol·licitud de classe per al <strong>${payload.date}</strong>.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/teacher" 
             style="background:#6c47ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">
            Veure sol·licitud
          </a>
        </div>`,
      };

    case "BOOKING_CONFIRMED":
      return {
        subject: "✅ Classe confirmada — Educamagics",
        html: `<div ${base}>
          <h2>Hola ${payload.userName},</h2>
          <p>El professor ha confirmat la classe del <strong>${payload.date}</strong>.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent"
             style="background:#6c47ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">
            Veure reserves
          </a>
        </div>`,
      };

    case "CLASS_REMINDER":
      return {
        subject: "⏰ La classe comença en 30 minuts — Educamagics",
        html: `<div ${base}>
          <h2>Recorda!</h2>
          <p>La classe de <strong>${payload.childName}</strong> comença en 30 minuts.</p>
        </div>`,
      };

    default:
      return {
        subject: "Notificació d'Educamagics",
        html: `<div ${base}><p>${JSON.stringify(payload)}</p></div>`,
      };
  }
}
