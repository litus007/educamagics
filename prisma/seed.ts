// prisma/seed.ts
// Dades de demostració per al desenvolupament local
// Executa: npm run db:seed

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Iniciant seed...");

  // ── Professor demo ──────────────────────────
  const teacherUser = await db.user.upsert({
    where: { email: "professor@demo.com" },
    update: {},
    create: {
      email: "professor@demo.com",
      name: "Maria García",
      role: "TEACHER",
      emailVerified: new Date(),
    },
  });

  const teacherProfile = await db.teacherProfile.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      bio: "Professora de matemàtiques i ciències amb 5 anys d'experiència.",
      rating: 4.8,
      ratingCount: 24,
      isActive: true,
      subjects: {
        create: [
          { subject: "MATH", level: "Primària" },
          { subject: "SCIENCE", level: "Primària" },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: "MON", startTime: "10:00", endTime: "11:00" },
          { dayOfWeek: "MON", startTime: "11:00", endTime: "12:00" },
          { dayOfWeek: "WED", startTime: "16:00", endTime: "17:00" },
          { dayOfWeek: "FRI", startTime: "10:00", endTime: "11:00" },
        ],
      },
    },
  });

  // ── Pare demo ───────────────────────────────
  const parentUser = await db.user.upsert({
    where: { email: "pare@demo.com" },
    update: {},
    create: {
      email: "pare@demo.com",
      name: "Joan Martínez",
      role: "PARENT",
      emailVerified: new Date(),
    },
  });

  const parentProfile = await db.parentProfile.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: { userId: parentUser.id, phone: "+34 600 000 000" },
  });

  // ── Nen demo ────────────────────────────────
  const childUser = await db.user.upsert({
    where: { email: "nen@demo.com" },
    update: {},
    create: {
      email: "nen@demo.com",
      name: "Pau Martínez",
      role: "CHILD",
      emailVerified: new Date(),
    },
  });

  const pinHash = await hash("1234", 10);

  const childProfile = await db.childProfile.upsert({
    where: { userId: childUser.id },
    update: {},
    create: {
      userId: childUser.id,
      pinHash,
      avatarKey: "rocket",
      points: 150,
    },
  });

  const child = await db.child.upsert({
    where: { parentId_childProfileId: { parentId: parentProfile.id, childProfileId: childProfile.id } },
    update: {},
    create: {
      displayName: "Pau",
      gradeLevel: "4t de primària",
      parentId: parentProfile.id,
      childProfileId: childProfile.id,
    },
  });

  // ── Reserva demo (avui) ─────────────────────
  const timeSlot = await db.timeSlot.findFirst({
    where: { teacherId: teacherProfile.id, dayOfWeek: "MON" },
  });

  if (timeSlot) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const booking = await db.booking.create({
      data: {
        childId: child.id,
        timeSlotId: timeSlot.id,
        date: today,
        status: "CONFIRMED",
        notes: "Repàs de fraccions",
      },
    });

    await db.classSession.create({
      data: {
        bookingId: booking.id,
        teacherId: teacherProfile.id,
        status: "SCHEDULED",
      },
    });
  }

  console.log("✅ Seed completat!");
  console.log("");
  console.log("Usuaris demo:");
  console.log("  Pare:      pare@demo.com      → Magic Link");
  console.log("  Professor: professor@demo.com  → Magic Link");
  console.log(`  Nen:       ID: ${childProfile.id}  PIN: 1234`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
