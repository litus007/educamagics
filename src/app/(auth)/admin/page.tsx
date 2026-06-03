// src/app/(auth)/admin/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // 1. Protecció de ruta estricta per a l'Administrador
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Petició de mètriques globals de la plataforma
  const [
    totalUsers,
    totalParents,
    totalTeachers,
    totalChildren,
    totalBookings,
    pendingBookings,
    recentUsers
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "PARENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.user.count({ where: { role: "CHILD" } }),
    (db as any).booking?.count() || 0,
    (db as any).booking?.count({ where: { status: "PENDING" } }) || 0,
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
  ]);

  return (
    <main 
      className="min-h-screen bg-cover bg-center p-4 md:p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/fons-estiu.png')" }}
    >
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Capçalera d'Administració */}
        <header className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sky-600 text-white text-xs font-black px-2.5 py-1 rounded-full tracking-wider uppercase">
                Panel Central
              </span>
            </div>
            <h1 className="text-3xl font-black text-sky-900 mt-1">👑 Administració Educamagics</h1>
            <p className="text-sky-700/80 text-sm font-medium">
              Hola, {session.user.name?.split(" ")[0]} · Control total del regne màgic
            </p>
          </div>
          <a 
            href="/api/auth/signout" 
            className="bg-white/50 hover:bg-white text-rose-600 font-bold px-5 py-2.5 rounded-xl transition-all text-sm border border-rose-100"
          >
            Sortir del panell
          </a>
        </header>

        {/* Targetes de Mètriques (Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-sm">
            <p className="text-xs font-bold text-sky-700/70 uppercase tracking-wider">Usuaris Totals</p>
            <h3 className="text-3xl font-black text-sky-950 mt-1">{totalUsers}</h3>
            <div className="flex gap-2 mt-2 text-xs text-sky-800 font-medium">
              <span>👨‍👩‍👦 {totalParents} p</span>
              <span>🧑‍🏫 {totalTeachers} pr</span>
              <span>👶 {totalChildren} n</span>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-sm">
            <p className="text-xs font-bold text-sky-700/70 uppercase tracking-wider">Reserves Totals</p>
            <h3 className="text-3xl font-black text-sky-950 mt-1">{totalBookings}</h3>
            <p className="text-xs text-sky-600 font-medium mt-2">Classes agendades aquest curs</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-amber-200/60 shadow-sm bg-amber-50/20">
            <p className="text-xs font-bold text-amber-800/80 uppercase tracking-wider">Pendents d'Aprovar</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingBookings}</h3>
            <p className="text-xs text-amber-700 font-medium mt-2">Classes esperant confirmació</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-sm">
            <p className="text-xs font-bold text-sky-700/70 uppercase tracking-wider">Estat de la BD</p>
            <h3 className="text-xl font-black text-emerald-600 mt-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Sincronitzat
            </h3>
            <p className="text-xs text-sky-600 font-medium mt-1">Prisma Client Online</p>
          </div>

        </div>

        {/* Zona Principal de Gestió */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Llista d'Últims Registres (Amplada 2 columnes) */}
          <section className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50 space-y-4">
            <h2 className="text-lg font-bold text-sky-900 flex items-center gap-2">
              🆕 Ús recent: Últims usuaris registrats
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sky-100 text-sky-800/70 font-bold">
                    <th className="py-2.5">Nom</th>
                    <th className="py-2.5">Correu</th>
                    <th className="py-2.5">Rol</th>
                    <th className="py-2.5">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50 font-medium text-sky-900">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 font-bold">{u.name || "Sense nom"}</td>
                      <td className="py-3 text-sky-700/90">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                          u.role === "TEACHER" ? "bg-amber-100 text-amber-700" :
                          u.role === "PARENT" ? "bg-sky-100 text-sky-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-sky-600">
                        {new Date(u.createdAt).toLocaleDateString("ca-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Menú d'Accions Ràpides de l'Administrador */}
          <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50 space-y-4">
            <h2 className="text-lg font-bold text-sky-900">⚡ Accions de control</h2>
            <div className="flex flex-col gap-2">
             <Link 
      href="/admin/users" 
      className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all text-left shadow-sm flex justify-between items-center"
    >
      <span>👥 Gestionar Usuaris</span>
      <span>➔</span>
    </Link>

    <Link 
      href="/admin/bookings" 
      className="w-full py-3 px-4 bg-white hover:bg-sky-50 text-sky-900 border border-sky-100 font-bold text-sm rounded-xl transition-all text-left flex justify-between items-center"
    >
      <span>📅 Monitoritzar Reserves</span>
      <span>➔</span>
    </Link>

    <Link 
      href="/admin/activities" 
      className="w-full py-3 px-4 bg-white hover:bg-sky-50 text-sky-900 border border-sky-100 font-bold text-sm rounded-xl transition-all text-left flex justify-between items-center"
    >
      <span>🧩 Banc d'Activitats de Lògica</span>
      <span>➔</span>
    </Link>
              <div className="pt-4 border-t border-sky-100 mt-2">
                <p className="text-xs text-sky-600 font-medium leading-relaxed">
                  💡 Com a Administrador, tens accés complet a les taules de <em>Booking</em>, <em>Attempt</em> i rànquings globals des d'aquest terminal.
                </p>
              </div>
            </div>
          </section>

        </div>
        
      </div>
    </main>
  );
}