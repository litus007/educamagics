// src/app/child/[childId]/page.tsx
export default function ChildDashboard({ params }: { params: { childId: string } }) {
  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-sky-950">Hola, campió! 👋</h1>
        <p className="text-sky-700">Què vols fer avui?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accés ràpid a la propera classe */}
        <section className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm">
          <h2 className="font-bold text-lg mb-4">La teva propera sessió</h2>
          {/* Aquí posaries el component de classe en directe */}
        </section>

        {/* Accés ràpid als jocs */}
        <section className="bg-sky-500 p-6 rounded-3xl text-white">
          <h2 className="font-bold text-lg mb-4">Jocs</h2>
          <a href={`/child/${params.childId}/games`} className="bg-white text-sky-600 px-4 py-2 rounded-xl font-bold">
            Jugar ara 🎮
          </a>
        </section>
      </div>
    </div>
  );
}