// src/components/dashboard/TeacherSessionList.tsx
// Llista de sessions d'avui per al professor.
// El botó "Obrir sala" canvia l'estat a LIVE i activa el botó del nen.

"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/components/layout/Providers";

interface Session {
  id: string;
  status: string;
  livekitRoom: string;
  booking: {
    child: { displayName: string };
    timeSlot: { startTime: string; endTime: string };
  };
}

export function TeacherSessionList({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const startSession = trpc.session.start.useMutation({
    onSuccess: (data) => {
      router.push(`/classroom/${data.id}`);
    },
  });

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
        <span className="text-3xl">🗓️</span>
        <p className="mt-2">No tens classes programades per avui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div
          key={s.id}
          className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between hover:border-violet-200 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-900">
              {s.booking.child.displayName}
            </p>
            <p className="text-sm text-gray-500">
              {s.booking.timeSlot.startTime} – {s.booking.timeSlot.endTime}
            </p>
            <span
              className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                s.status === "LIVE"
                  ? "bg-green-100 text-green-700"
                  : s.status === "ENDED"
                  ? "bg-gray-100 text-gray-500"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {s.status === "LIVE" && "🟢 En directe"}
              {s.status === "SCHEDULED" && "🗓️ Programada"}
              {s.status === "ENDED" && "✅ Finalitzada"}
            </span>
          </div>

          <div className="ml-4 flex-shrink-0">
            {s.status === "SCHEDULED" && (
              <button
                onClick={() => startSession.mutate({ sessionId: s.id })}
                disabled={startSession.isPending}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                {startSession.isPending ? "Obrint..." : "Obrir sala 🚀"}
              </button>
            )}
            {s.status === "LIVE" && (
              <button
                onClick={() => router.push(`/classroom/${s.id}`)}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                Tornar a la sala →
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
