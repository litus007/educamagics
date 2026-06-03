// src/components/dashboard/TeacherSearch.tsx
// Cercador de professors amb filtres per matèria i dia

"use client";

import { useState } from "react";
import { trpc } from "@/components/layout/Providers";

const SUBJECTS = [
  { value: "", label: "Totes les matèries" },
  { value: "MATH", label: "🔢 Matemàtiques" },
  { value: "LANGUAGE", label: "📚 Llengua" },
  { value: "ENGLISH", label: "🇬🇧 Anglès" },
  { value: "SCIENCE", label: "🔬 Ciències" },
  { value: "HISTORY", label: "🏛️ Història" },
];

const DAYS = [
  { value: "", label: "Qualsevol dia" },
  { value: "MON", label: "Dilluns" },
  { value: "TUE", label: "Dimarts" },
  { value: "WED", label: "Dimecres" },
  { value: "THU", label: "Dijous" },
  { value: "FRI", label: "Divendres" },
  { value: "SAT", label: "Dissabte" },
];

export function TeacherSearch() {
  const [subject, setSubject] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.teacher.search.useQuery(
    { subject: subject || undefined, dayOfWeek: dayOfWeek || undefined, page },
    { keepPreviousData: true }
  );

  return (
    <div className="space-y-5">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <select
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={dayOfWeek}
          onChange={(e) => { setDayOfWeek(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {DAYS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Resultats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>

          {data?.teachers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <span className="text-3xl">🔍</span>
              <p className="mt-2">No s'han trobat professors amb aquests filtres.</p>
            </div>
          )}

          {/* Paginació */}
          {data && data.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Següent →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Targeta de professor ──────────────────────────────────────────────────

function TeacherCard({ teacher }: { teacher: any }) {
  const subjectEmoji: Record<string, string> = {
    MATH: "🔢", LANGUAGE: "📚", ENGLISH: "🇬🇧",
    SCIENCE: "🔬", HISTORY: "🏛️", MUSIC: "🎵", ART: "🎨",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-xl flex-shrink-0">
          🧑‍🏫
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {teacher.user.name}
          </p>
          {teacher.rating && (
            <p className="text-sm text-amber-500">
              ⭐ {teacher.rating.toFixed(1)}{" "}
              <span className="text-gray-400">({teacher.ratingCount})</span>
            </p>
          )}
        </div>
      </div>

      {/* Matèries */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {teacher.subjects.slice(0, 4).map((s: any) => (
          <span
            key={s.id}
            className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full"
          >
            {subjectEmoji[s.subject] ?? "📖"} {s.subject}
            {s.level && ` · ${s.level}`}
          </span>
        ))}
      </div>

      {/* Disponibilitat */}
      <p className="text-xs text-gray-400 mb-4">
        {teacher.availability.length} franges disponibles
      </p>

      <button className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors">
        Sol·licitar classe
      </button>
    </div>
  );
}
