// src/components/dashboard/ChildClassCard.tsx
// Targeta de classe per al nen.
// Fa polling cada 10 s per detectar quan el professor és a la sala
// i activa el botó "Entrar".

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/components/layout/Providers";

interface Props {
  booking: { id: string };
  sessionId?: string;
  sessionStatus?: string;
  teacherName: string;
  teacherImage?: string | null;
  startTime: string;
  endTime: string;
}

export function ChildClassCard({
  sessionId,
  sessionStatus: initialStatus,
  teacherName,
  startTime,
  endTime,
}: Props) {
  const router = useRouter();
  const [isLive, setIsLive] = useState(initialStatus === "LIVE");

  // Polling cada 10 s quan la sessió no és LIVE encara
  const { data } = trpc.session.checkLive.useQuery(
    { sessionId: sessionId ?? "" },
    {
      enabled: !!sessionId && !isLive,
      refetchInterval: 10_000,
      refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    if (data?.isLive) setIsLive(true);
  }, [data?.isLive]);

  function handleEnter() {
    if (sessionId) router.push(`/classroom/${sessionId}`);
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg">
      {/* Info del professor */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-2xl flex-shrink-0">
          🧑‍🏫
        </div>
        <div>
          <p className="font-semibold text-gray-900">{teacherName}</p>
          <p className="text-gray-500 text-sm">
            {startTime} – {endTime}
          </p>
        </div>
        {/* Indicador de live */}
        {isLive && (
          <div className="ml-auto flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            EN DIRECTE
          </div>
        )}
      </div>

      {/* Botó d'entrada */}
      <button
        onClick={handleEnter}
        disabled={!isLive || !sessionId}
        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 ${
          isLive
            ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200 scale-100 active:scale-95"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isLive ? "🚀 Entrar a la classe!" : "⏳ Esperant el professor..."}
      </button>

      {!isLive && (
        <p className="text-center text-gray-400 text-xs mt-2">
          El botó s'activarà quan el professor entri a la sala
        </p>
      )}
    </div>
  );
}
