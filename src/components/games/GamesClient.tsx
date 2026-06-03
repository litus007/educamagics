// src/components/games/GamesClient.tsx
// Orquestrador client del mòdul de jocs:
// pestanyes Repte / Rànquing + selector d'edat + gestió d'estat

// src/components/games/GamesClient.tsx
"use client";

import { useState } from "react";
import { LogicChallenge } from "./LogicChallenge";
import { GlobalRanking, type RankingEntry } from "./GlobalRanking";
import { getActivitiesForAge } from "@/lib/scoring";
import type { ScoreBreakdown } from "@/lib/scoring";

interface Props {
  userId: string;
  userName: string;
  estimatedAge: number;
  ranking: RankingEntry[];
  myRank?: number;
  myPoints: number;
  totalPlayers: number;
}

type Tab = "challenge" | "ranking";
type ChallengeState = "selecting" | "playing" | "done";

export function GamesClient({
  userId, userName, estimatedAge,
  ranking, myRank, myPoints, totalPlayers,
}: Props) {
  const [tab, setTab] = useState<Tab>("challenge");
  const [age, setAge] = useState(estimatedAge);
  const [challengeState, setChallengeState] = useState<ChallengeState>("selecting");
  const [activityIndex, setActivityIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  // Carrega dinàmica d'activitats per edat configurada a scoring.ts
  const activities = getActivitiesForAge(age);
  const currentActivity = activities[activityIndex % activities.length];

  async function handleComplete(result: {
    activityId: string;
    answer: string;
    isCorrect: boolean;
    timeSpentMs: number;
    score: ScoreBreakdown;
  }) {
    if (result.isCorrect) {
      setSessionCorrect((p) => p + 1);
      setSessionScore((p) => p + result.score.total);
    }

    setChallengeState("done");

    // Sincronització en segon pla (fire-and-forget) amb l'API d'intents creada prèviament
    try {
      await fetch("/api/games/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: result.activityId,
          answer: result.answer,
          isCorrect: result.isCorrect,
          timeSpentMs: result.timeSpentMs,
          pointsEarned: result.score.total,
          pointsBreakdown: result.score,
        }),
      });
    } catch (e) {
      console.error("Error sincronitzant l'intent:", e);
    }
  }

  function handleNext() {
    setActivityIndex((prev) => prev + 1);
    setChallengeState("playing");
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Pestanyes de Navegació estil Vidre Màgic */}
      <div className="flex justify-center">
        <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 flex gap-1 shadow-md">
          <button
            onClick={() => setTab("challenge")}
            className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
              tab === "challenge"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-sky-950 hover:bg-white/40"
            }`}
          >
            🧩 Reptes del Dia
          </button>
          <button
            onClick={() => setTab("ranking")}
            className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
              tab === "ranking"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-sky-950 hover:bg-white/40"
            }`}
          >
            🏆 Rànquing Global
          </button>
        </div>
      </div>

      {/* Contingut segons la pestanya activa */}
      {tab === "challenge" ? (
        <div className="space-y-6">
          
          {/* Selector de franja d'edat activa */}
          {challengeState === "selecting" && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl text-center space-y-4 max-w-md mx-auto">
              <div className="text-4xl">🏝️</div>
              <h2 className="text-xl font-black text-sky-950">Prepara el teu cervell!</h2>
              <p className="text-xs font-medium text-sky-800/80 leading-relaxed">
                Tria el teu nivell segons la teva edat per activar la màgia dels reptes de lògica d'avui.
              </p>
              
              <div className="flex justify-center gap-2 pt-2">
                {[7, 10, 13].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAge(a)}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs border transition-all ${
                      age === a
                        ? "bg-sky-600 text-white border-sky-500 shadow-md scale-105"
                        : "bg-white/60 text-sky-900 border-white/40 hover:bg-white"
                    }`}
                  >
                    {a === 7 ? "🌱 6-8 anys" : a === 10 ? "🔥 9-11 anys" : "🧠 12-14 anys"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setChallengeState("playing")}
                className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                Començar l'Aventura ✨
              </button>
            </div>
          )}

          {/* Renderitzat del Repte en curs (LogicChallenge actualitzat) */}
          {challengeState === "playing" && (
            <LogicChallenge activity={currentActivity} onComplete={handleComplete} />
          )}

          {/* Pantalla Final unificada de resum de puntuació (DoneCard Estival) */}
          {challengeState === "done" && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border border-white/60 max-w-md mx-auto space-y-5 animate-fade-in">
              <div className="text-5xl animate-bounce">
                {sessionScore > 150 ? "👑" : "🌟"}
              </div>
              <div>
                <h3 className="text-2xl font-black text-sky-950">
                  {sessionScore > 150 ? "Increïble, ets un mag!" : "Molt bon treball!"}
                </h3>
                <p className="text-sky-800/80 text-xs font-medium mt-1">
                  Has guanyat <span className="text-amber-600 font-black">+{sessionScore} punts</span> amb {sessionCorrect} respostes correctes.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl shadow-md transition-all"
                >
                  Següent Repte ➔
                </button>
                <button
                  onClick={() => { setTab("ranking"); setChallengeState("selecting"); }}
                  className="w-full py-3 bg-white hover:bg-sky-50 text-sky-950 border border-sky-100 font-black text-sm rounded-xl transition-all"
                >
                  Veure la meva posició 🏆
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Pestanya de Rànquing unificada */
        <GlobalRanking
          entries={ranking}
          currentUserRank={myRank}
          totalPlayers={totalPlayers}
        />
      )}
    </div>
  );
}
