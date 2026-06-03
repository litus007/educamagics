import { db } from "@/lib/db";
import DeleteUserButton from "@/components/admin/DeleteUserButton"; // Suposo que tens un component així
export const dynamic = 'force-dynamic'
export default async function EstudiantsPage() {
  const students = await db.childProfile.findMany({
    include: { user: true }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestió d'Estudiants</h1>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-4">Nom</th>
            <th className="p-4">Email Pare</th>
            <th className="p-4">Accions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-4">{s.user.name}</td>
              <td className="p-4">{s.user.email}</td>
              <td className="p-4">
                {/* Aquí connectem la lògica d'esborrar */}
                <DeleteUserButton userId={s.userId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}