// src/app/(auth)/teacher/page.tsx
// Portal del professor: classes d'avui + gestió de reserves pendents

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { TeacherSessionList } from "@/components/dashboard/TeacherSessionList";
import { PendingBookingCard } from "@/components/dashboard/PendingBookingCard";
import { trpc } from "@/lib/trpc/client";
import { BookingStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

export default async function TeacherPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySessions = await db.classSession.findMany({
    where: {
      teacher: { userId: session.user.id },
      booking: { date: { gte: today, lt: tomorrow } },
    },
    include: {
      booking: { include: { child: true, timeSlot: true } },
    },
    orderBy: { booking: { timeSlot: { startTime: "asc" } } },
  });

  const pendingBookings = await db.booking.findMany({
  where: {
    timeSlot: { teacher: { userId: session.user.id } },
    status: BookingStatus.PENDING_TEACHER, // Utilitza l'Enum en comptes del string
  },
  include: { child: true, timeSlot: true },
  orderBy: { createdAt: "asc" },
});

  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { rating: true, ratingCount: true },
  });

  return (
    <main 
      className="min-h-screen bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: "url('/fons-estiu.png')" }}
    >
      {/* Header Glassmorphism */}
      <header className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">🧑‍🏫 Educamagics</h1>
          <p className="text-sky-700/80 text-sm font-medium">
            Hola, {session.user.name} 
            {teacherProfile?.rating && (
              <span className="ml-2 text-amber-600 font-bold">
                ⭐ {teacherProfile.rating.toFixed(1)}
              </span>
            )}
          </p>
        </div>
        <a href="/api/auth/signout" className="bg-white/50 hover:bg-white text-rose-600 font-bold px-4 py-2 rounded-xl transition-all text-sm">
          Sortir
        </a>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Sol·licituds pendents */}
        {pendingBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-sky-900 mb-4 flex items-center gap-2">
              Sol·licituds pendents
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingBookings.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <PendingBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        )}

        {/* Classes d'avui */}
        <section className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
          <h2 className="text-lg font-bold text-sky-900 mb-4">Classes d'avui</h2>
          <TeacherSessionList sessions={todaySessions} />
        </section>
      </div>
    </main>
  );
}