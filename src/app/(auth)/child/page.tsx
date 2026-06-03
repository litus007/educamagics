import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { ChildClassCard } from "@/components/dashboard/ChildClassCard";

export default async function ChildPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CHILD") redirect("/login");

  // ... (mantenim la teva lògica de bookings igual)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await db.booking.findMany({
    where: {
      child: { childProfile: { userId: session.user.id } },
      date: { gte: today, lt: tomorrow },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    include: {
      timeSlot: { include: { teacher: { include: { user: { select: { name: true, image: true } } } } } },
      session: { select: { id: true, status: true } },
    },
    orderBy: { timeSlot: { startTime: "asc" } },
  });

  const childProfile = await db.childProfile.findUnique({
    where: { userId: session.user.id },
    select: { points: true, avatarKey: true },
  });

  const avatarEmoji: Record<string, string> = { wizard: "🧙", rocket: "🚀", dragon: "🐲", star: "⭐" };
  const avatar = avatarEmoji[childProfile?.avatarKey ?? "star"] ?? "⭐";

  return (
    <main 
      className="min-h-screen bg-cover bg-center p-4 pb-12"
      style={{ backgroundImage: "url('/fons-estiu.png')" }}
    >
      {/* Capçalera amb efecte vidre */}
      <header className="max-w-md mx-auto bg-white/70 backdrop-blur-md rounded-3xl p-6 text-center shadow-xl border border-white/50 mb-6">
        <div className="text-6xl mb-2">{avatar}</div>
        <h1 className="text-sky-900 text-2xl font-bold">
          Hola, {session.user.name?.split(" ")[0]}!
        </h1>
        <div className="inline-flex items-center gap-1.5 bg-amber-500 rounded-full px-4 py-1.5 mt-3 shadow-md">
          <span className="text-white text-sm font-bold">
            ⭐ {childProfile?.points ?? 0} punts màgics
          </span>
        </div>
      </header>

      {/* Classes amb fons suau */}
      <section className="max-w-md mx-auto">
        <h2 className="text-sky-900/80 text-sm font-bold uppercase tracking-wider mb-3 px-1 drop-shadow-sm">
          Les teves classes d'avui
        </h2>

        {bookings.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 text-center border border-white/50 shadow-lg">
            <span className="text-4xl">🎉</span>
            <p className="text-sky-900 font-bold mt-3">Avui no tens classes!</p>
            <p className="text-sky-700/80 text-sm mt-1">Aprofita per explorar els reptes!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-md border border-white/50">
                <ChildClassCard
                  booking={booking}
                  sessionId={booking.session?.id}
                  sessionStatus={booking.session?.status}
                  teacherName={booking.timeSlot.teacher.user.name ?? "Professor"}
                  teacherImage={booking.timeSlot.teacher.user.image}
                  startTime={booking.timeSlot.startTime}
                  endTime={booking.timeSlot.endTime}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
