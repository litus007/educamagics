import { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <img src="/logo.png" alt="Educamagics" className="w-32" />
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="block px-4 py-3 rounded-xl bg-sky-50 text-sky-700 font-bold">
            📊 Tauler Principal
          </Link>
          <Link href="/admin/estudiants" className="block px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            👥 Estudiants
          </Link>
          <Link href="/admin/activitats" className="block px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            📝 Activitats
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 uppercase tracking-widest">
            Tancar Sessió
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-slate-800 font-bold">Panell d'Administració</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Estiu 2026</span>
            <div className="w-8 h-8 bg-sky-500 rounded-full"></div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}