import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { TeacherSearch } from "@/components/parent/TeacherSearch";
import { BookingList } from "@/components/common/BookingList";

// Imports per a tRPC en el servidor
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc-init";

export default async function ParentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PARENT") redirect("/login");

  // Preparem els helpers per fer fetch des del servidor amb tRPC
 const caller = appRouter.createCaller({
    session: session,
    db: db,
  });

  // Fetch de dades en paral·lel
  const [children, teachers, bookings] = await Promise.all([
    db.child.findMany({ where: { parent: { userId: session.user.id } }, include: { childProfile: true } }),
    db.user.findMany({ where: { role: "TEACHER" }, select: { id: true, name: true, teacherProfile: { select: { bio: true, rating: true } } } }),
    caller.booking.listForParent(), // Utilitzem el nostre endpoint segur
  ]);

  return (
    <main className="min-h-screen bg-cover bg-center p-4 md:p-8" style={{ backgroundImage: "url('/fons-estiu.png')" }}>
      
      {/* Header */}
      <header className="max-w-5xl mx-auto bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-sky-900">Educamagics</h1>
          <p className="text-sky-700/80 text-sm font-medium">Hola, {session.user.name?.split(" ")[0]} 👋.</p>
        </div>
        <a href="/api/auth/signout" className="bg-white/50 hover:bg-white text-rose-600 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-rose-100">Sortir</a>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Accions Ràpides */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-sky-600 rounded-3xl text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Nova Reserva</h3>
            <p className="text-sky-100 text-sm mb-4">Selecciona el fill i el professor per començar.</p>
            <a href="/parent/booking/new" className="inline-block bg-white text-sky-700 px-6 py-2 rounded-xl font-bold hover:bg-sky-50 transition-all">
              Inicia reserva ➔
            </a>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-sky-100 shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-sky-900 mb-2">Necessites ajuda?</h3>
            <p className="text-gray-600 text-sm mb-4">Qualsevol dubte o modificació, contacta amb nosaltres.</p>
            <a href="mailto:admin@educamagics.com" className="text-sky-600 font-bold hover:underline">
              ✉️ Enviar MD a l'administració
            </a>
          </div>
        </section>

        {/* Cercador */}
        <section className="bg-white/10 backdrop-blur-xs rounded-3xl p-2">
          <h2 className="text-xl font-black text-sky-900 mb-3 px-4">🔍 Mentors disponibles</h2>
          <TeacherSearch initialTeachers={teachers.map(t => ({ id: t.id, name: t.name || "", bio: t.teacherProfile?.bio || "", rating: t.teacherProfile?.rating || 5, specialties: ["Lògica"] }))} />
        </section>

        {/* Reserves - Ara mapejades correctament */}
        <section className="bg-white/10 backdrop-blur-xs rounded-3xl p-2">
          <BookingList 
            bookings={bookings.map((b) => ({ 
              ...b, 
              teacherName: b.timeSlot?.teacher?.user?.name ?? "Mentor", 
              childName: b.child?.displayName ?? "Alumne",
              status: b.status as any // Coincideix amb els nous estats del BookingList
            }))} 
          />
        </section>
      </div>
    </main>
  );
}
