"use client";
import { trpc } from "@/lib/trpc/client";
export const dynamic = 'force-dynamic'
export default function ActivityManagementPage() {
  const { data: activities } = trpc.activity.listAll.useQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-sky-950">Banc d'Activitats</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities?.map((act) => (
          <div key={act.id} className="p-4 border rounded-xl bg-white shadow-sm">
            <h2 className="font-bold text-lg">{act.title}</h2>
            <p className="text-sm text-sky-600">Tipus: {act.type} | Dificultat: {act.difficulty}</p>
            <p className="text-xs mt-2">Punts base: {act.pointsBase}</p>
          </div>
        ))}
      </div>
    </div>
  );
}