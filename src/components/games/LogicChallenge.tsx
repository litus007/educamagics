// src/components/games/LogicChallenge.tsx
// Component principal del joc de lògica
// Mostra el repte, el temporitzador i la retroalimentació de resposta

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Activity, ScoreBreakdown } from "@/lib/scoring";
import { calculateScore } from "@/lib/scoring";
import { ScorePop } from "./ScorePop";
import { TimerRing } from "./TimerRing";

interface Props {
  activity: Activity;
  onComplete: (result: {
    activityId: string;
    answer: string;
    isCorrect: boolean;
    timeSpentMs: number;
    score: ScoreBreakdown;
  }) => void;
}

type Phase = "idle" | "playing" | "correct" | "wrong";

export function LogicChallenge({ activity, onComplete }: Props) {
  const { payload, timeLimit, difficulty, pointsBase } = activity;
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Inicia la partida
  function startGame() {
    setPhase("playing");
    setSelectedIdx(null);
    setShowHint(false);
    setTimeLeft(timeLimit);
    setScore(null);
    startTimeRef.current = Date.now();
  }

  // Temporitzador
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          handleAnswer(-1); // temps esgotat → resposta incorrecta
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [phase]);

  function handleAnswer(idx: number) {
    if (phase !== "playing") return;
    stopTimer();

    const timeSpentMs = Date.now() - startTimeRef.current;
    const isCorrect = idx === payload.correctIndex;
    const breakdown = calculateScore({
      isCorrect,
      timeSpentMs,
      timeLimitSecs: timeLimit,
      difficulty,
      pointsBase,
    });

    setSelectedIdx(idx);
    setScore(breakdown);
    setPhase(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      onComplete({
        activityId: activity.id,
        answer: String(idx),
        isCorrect,
        timeSpentMs,
        score: breakdown,
      });
    }, 2200);
  }

  const progressPct = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Targeta principal */}
      <div
        className={`
          relative rounded-3xl overflow-hidden shadow-2xl
          transition-all duration-500
          ${phase === "correct" ? "ring-4 ring-[#4CAF50] shadow-green-200" : ""}
          ${phase === "wrong" ? "ring-4 ring-[#FF5252] shadow-red-200" : ""}
        `}
        style={{ background: "linear-gradient(160deg, #E0F4FF 0%, #FFF9E6 100%)" }}
      >
        {/* Banda de dificultat */}
        <div
          className={`h-1.5 w-full`}
          style={{
            background:
              difficulty === "EASY"
                ? "linear-gradient(90deg,#43C6AC,#91EAE4)"
                : difficulty === "MEDIUM"
                ? "linear-gradient(90deg,#F7971E,#FFD200)"
                : "linear-gradient(90deg,#FF416C,#FF4B2B)",
          }}
        />

        <div className="p-6 pb-8">
          {/* Capçalera: badge dificultat + temporitzador */}
          <div className="flex items-center justify-between mb-5">
            <DifficultyBadge level={difficulty} />
            {phase === "playing" && (
              <TimerRing
                timeLeft={timeLeft}
                total={timeLimit}
                urgent={isUrgent}
              />
            )}
          </div>

          {/* Títol del repte */}
          <h2
            className="text-2xl font-black text-[#1A2B5F] mb-1 leading-tight"
            style={{ fontFamily: "'Nunito', 'Fredoka One', sans-serif" }}
          >
            {payload.question}
          </h2>
          {payload.description && (
            <p className="text-sm text-[#5B7BAE] mb-4">{payload.description}</p>
          )}

          {/* Visualització de la sèrie numèrica */}
          {payload.sequence && (
            <div className="flex items-center justify-center gap-2 my-5 flex-wrap">
              {payload.sequence.map((n, i) => (
                <div key={i} className="flex items-center gap-2">
                  {n === null ? (
                    <div
                      className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black
                        border-4 border-dashed transition-all duration-300
                        ${
                          phase === "correct"
                            ? "bg-green-100 border-green-400 text-green-600"
                            : phase === "wrong"
                            ? "bg-red-100 border-red-400 text-red-500"
                            : "bg-white/70 border-[#A8C8E8] text-[#A8C8E8] animate-pulse"
                        }
                      `}
                    >
                      {phase === "correct"
                        ? payload.options[payload.correctIndex].label
                        : phase === "wrong" && selectedIdx !== null
                        ? payload.options[selectedIdx]?.label ?? "?"
                        : "?"}
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl font-black text-[#1A2B5F]">
                      {n}
                    </div>
                  )}
                  {i < payload.sequence!.length - 1 && (
                    <span className="text-[#A8C8E8] font-bold text-lg">→</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fase IDLE: botó d'inici */}
          {phase === "idle" && (
            <button
              onClick={startGame}
              className="w-full mt-4 py-4 rounded-2xl font-black text-lg text-white shadow-lg active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(135deg,#FF9500,#FFD700)",
                boxShadow: "0 6px 20px rgba(255,149,0,0.4)",
              }}
            >
              🚀 Comença el repte!
            </button>
          )}

          {/* Fase PLAYING: opcions de resposta */}
          {phase === "playing" && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {payload.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="
                    relative py-4 px-3 rounded-2xl font-black text-lg
                    bg-white shadow-md border-2 border-white
                    hover:border-[#FFD700] hover:scale-105 hover:shadow-xl
                    active:scale-95 transition-all duration-150
                    text-[#1A2B5F] flex flex-col items-center gap-1
                  "
                >
                  {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Fase CORRECT / WRONG: feedback */}
          {(phase === "correct" || phase === "wrong") && (
            <div className="mt-4 space-y-3">
              {/* Opcions amb colors de resultat */}
              <div className="grid grid-cols-2 gap-3">
                {payload.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`
                      py-4 px-3 rounded-2xl font-black text-lg border-2
                      flex flex-col items-center gap-1 transition-all
                      ${
                        idx === payload.correctIndex
                          ? "bg-green-100 border-green-400 text-green-700"
                          : idx === selectedIdx && idx !== payload.correctIndex
                          ? "bg-red-100 border-red-400 text-red-600"
                          : "bg-white/50 border-transparent text-gray-400"
                      }
                    `}
                  >
                    {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                    <span>{opt.label}</span>
                    {idx === payload.correctIndex && (
                      <span className="text-xs">✓ Correcte</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Banner resultat */}
              <div
                className={`rounded-2xl p-4 text-center ${
                  phase === "correct"
                    ? "bg-green-50 border-2 border-green-300"
                    : "bg-amber-50 border-2 border-amber-300"
                }`}
              >
                {phase === "correct" ? (
                  <>
                    <p className="text-2xl font-black text-green-700">
                      🎉 Excel·lent!
                    </p>
                    {score && (
                      <p className="text-sm text-green-600 mt-1">
                        +{score.base} base &nbsp;·&nbsp; +{score.timeBonus}{" "}
                        velocitat &nbsp;·&nbsp; +{score.difficultyBonus} dificultat
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xl font-black text-amber-700">
                      😅 Gairebé!
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      💡 Pista: {payload.hint}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Pista (fase playing) */}
          {phase === "playing" && (
            <div className="mt-4 text-center">
              {showHint ? (
                <p className="text-sm text-[#5B7BAE] bg-blue-50 rounded-xl px-4 py-2">
                  💡 {payload.hint}
                </p>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs text-[#A8C8E8] underline underline-offset-2 hover:text-[#5B7BAE]"
                >
                  Necessito una pista (−30 punts)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pop de puntuació flotant */}
      {phase === "correct" && score && (
        <ScorePop points={score.total} />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: string }) {
  const cfg = {
    EASY: { label: "Fàcil 🌱", bg: "#E8F8F0", text: "#2E7D52" },
    MEDIUM: { label: "Mitjà 🔥", bg: "#FFF4E0", text: "#B45309" },
    HARD: { label: "Difícil 🧠", bg: "#FFE8E8", text: "#B91C1C" },
  }[level] ?? { label: level, bg: "#F0F0F0", text: "#666" };

  return (
    <span
      className="text-xs font-black px-3 py-1.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
