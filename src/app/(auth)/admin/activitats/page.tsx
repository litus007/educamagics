import { db } from "@/lib/db";

export default async function ActivitatsPage() {
  // Obtenim les sessions incloent la reserva i el professor
  const activitats = await db.classSession.findMany({
    include: {
      booking: {
        include: {
          child: true, // Per veure qui és el nen
          timeSlot: true // Per veure l'horari
        }
      },
      teacher: {
        include: { user: true } // Per veure el nom del professor
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestió d'Activitats (Sessions)</h1>
      <div className="grid gap-4">
        {activitats.map((act) => (
          <div key={act.id} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="font-semibold text-lg">
              Sessió amb {act.teacher.user.name || "Professor"}
            </h2>
            <p className="text-sm text-gray-600">
              Estudiant: {act.booking.child.displayName}
            </p>
            <p className="text-sm text-gray-600">
              Estatus: <span className="font-bold">{act.status}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Data: {act.booking.date.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}