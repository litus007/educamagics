// src/app/child/[childId]/layout.tsx
export default function ChildLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { childId: string };
}) {
  return (
    <div className="min-h-screen bg-sky-50">
      <nav className="bg-white border-b border-sky-100 p-4 flex justify-between items-center">
        <span className="font-black text-sky-950 text-xl">EducaMàgics</span>
        <div className="flex gap-4">
          <a href={`/child/${params.childId}`} className="text-sm font-bold text-sky-700">Inici</a>
          <a href={`/child/${params.childId}/classes`} className="text-sm font-bold text-sky-700">Les meves classes</a>
          <a href={`/child/${params.childId}/games`} className="text-sm font-bold text-sky-700">Jocs</a>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
}