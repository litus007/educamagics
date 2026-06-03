// src/components/parent/TeacherSearch.tsx
"use client";

import { useState } from "react";

interface Teacher {
  id: string;
  name: string;
  avatarKey?: string;
  specialties: string[];
  bio: string;
  rating: number;
}

interface TeacherSearchProps {
  initialTeachers: Teacher[];
}

export function TeacherSearch({ initialTeachers }: TeacherSearchProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Totes");

  // Extreure totes les especialitats úniques per als botons de filtre ràpid
  const allSpecialties = [
    "Totes",
    ...Array.from(new Set(initialTeachers.flatMap((t) => t.specialties))),
  ];

  // Filtrar la llista de professors en temps real
  const filteredTeachers = initialTeachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.bio.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "Totes" || t.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      {/* Barra de cerca i Filtres estil Vidre */}
      <div className="bg-white/40 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-lg space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Cerca per nom del professor, matèria, habilitats..."
            className="w-full pl-11 pr-4 py-3 bg-white/60 border border-white/40 rounded-2xl outline-none focus:border-sky-400 font-medium text-sky-950 placeholder-sky-800/50 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtres ràpids per especialitat */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allSpecialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                selectedSpecialty === specialty
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20 scale-105"
                  : "bg-white/40 hover:bg-white/70 text-sky-900 border border-white/30"
              }`}
            >
              {specialty === "Totes" ? "🌌 Totes les matèries" : specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Graella de fitxes de professors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="group bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Capçalera del Perfil */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-400 flex items-center justify-center text-xl shadow-inner font-bold text-white">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-sky-950 group-hover:text-sky-600 transition-colors">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-black mt-0.5">
                        <span>⭐</span>
                        <span>{teacher.rating.toFixed(1)}</span>
                        <span className="text-sky-800/40 font-normal ml-0.5">(excel·lent)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biografia curteta */}
                <p className="text-sky-900/80 text-xs font-medium leading-relaxed line-clamp-2">
                  {teacher.bio}
                </p>

                {/* Etiquetes d'Especialitat */}
                <div className="flex flex-wrap gap-1">
                  {teacher.specialties.map((s) => (
                    <span
                      key={s}
                      className="bg-sky-100/60 text-sky-800 text-[10px] font-black px-2.5 py-1 rounded-md border border-sky-100"
                    >
                      {s.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botó d'Acció de Reserva */}
              <div className="pt-5 mt-4 border-t border-sky-100/30">
                <button 
                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl shadow-md shadow-sky-500/10 active:scale-95 transition-all flex items-center justify-center gap-1"
                  onClick={() => alert(`Funció de reserva oberta per al Dr/a. ${teacher.name}`)}
                >
                  <span>📅 Reservar una sessió màgica</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white/30 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20">
            <p className="text-sm font-bold text-sky-900/60">🔮 No hem trobat cap mentor que coincideixi amb la cerca.</p>
          </div>
        )}
      </div>
    </div>
  );
}