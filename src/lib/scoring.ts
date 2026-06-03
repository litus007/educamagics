// src/lib/games/scoring.ts
// Sistema de puntuació i generació de reptes per al mòdul de jocs de lògica

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE PUNTUACIÓ
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoringParams {
  isCorrect: boolean;
  timeSpentMs: number;
  timeLimitSecs: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pointsBase: number;
}

export interface ScoreBreakdown {
  base: number;
  timeBonus: number;
  difficultyBonus: number;
  total: number;
}

const DIFFICULTY_MULTIPLIER = { EASY: 1, MEDIUM: 1.5, HARD: 2.5 };

export function calculateScore(params: ScoringParams): ScoreBreakdown {
  if (!params.isCorrect) return { base: 0, timeBonus: 0, difficultyBonus: 0, total: 0 };

  const { timeSpentMs, timeLimitSecs, difficulty, pointsBase } = params;
  const timeLimitMs = timeLimitSecs * 1000;

  // Bonificació de temps: fins al 100% extra si respon molt ràpid
  // Decreix linealment: 100% al primer 10% del temps, 0% a partir del 80%
  const timeRatio = Math.max(0, timeSpentMs / timeLimitMs);
  const timeBonusPct = Math.max(0, 1 - timeRatio / 0.8); // 0.0 – 1.0
  const timeBonus = Math.round(pointsBase * timeBonusPct);

  // Bonificació de dificultat
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const base = Math.round(pointsBase * multiplier);
  const difficultyBonus = base - pointsBase;

  const total = base + timeBonus;
  return { base: pointsBase, timeBonus, difficultyBonus, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITATS DE DEMO (en producció vindrien de la BBDD)
// ─────────────────────────────────────────────────────────────────────────────

export type ActivityOption = {
  label: string;
  emoji?: string;
};

export type ActivityPayload = {
  question: string;
  description?: string;
  options: ActivityOption[];
  correctIndex: number; // índex 0-based de l'opció correcta
  hint: string;
  visual?: "numbers" | "shapes" | "emoji-grid";
  sequence?: (number | null)[];
};

export type Activity = {
  id: string;
  type: "NUMBER_SERIES" | "VISUAL_PATTERN" | "ODD_ONE_OUT" | "MATH_SPEED";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  title: string;
  payload: ActivityPayload;
  pointsBase: number;
  timeLimit: number;
};

// Banc d'activitats per als 3 nivells d'edat
export const DEMO_ACTIVITIES: Activity[] = [
  // ── EASY (6-8 anys) ──────────────────────────────────────────────────────
  {
    id: "act-1",
    type: "NUMBER_SERIES",
    difficulty: "EASY",
    title: "Sèrie de nombres",
    pointsBase: 100,
    timeLimit: 30,
    payload: {
      question: "Quina és la xifra que falta?",
      description: "Fixa't en el patró de la sèrie",
      visual: "numbers",
      sequence: [2, 4, 6, null, 10],
      options: [
        { label: "7" },
        { label: "8", emoji: "⭐" },
        { label: "9" },
        { label: "12" },
      ],
      correctIndex: 1,
      hint: "Suma 2 cada vegada!",
    },
  },
  {
    id: "act-2",
    type: "ODD_ONE_OUT",
    difficulty: "EASY",
    title: "Quin no hi encaixa?",
    pointsBase: 100,
    timeLimit: 25,
    payload: {
      question: "Quin d'aquests no forma part del grup?",
      options: [
        { label: "Gat", emoji: "🐱" },
        { label: "Gos", emoji: "🐶" },
        { label: "Taula", emoji: "🪑" },
        { label: "Ocell", emoji: "🐦" },
      ],
      correctIndex: 2,
      hint: "Tres d'ells són animals...",
    },
  },

  // ── MEDIUM (9-11 anys) ───────────────────────────────────────────────────
  {
    id: "act-3",
    type: "NUMBER_SERIES",
    difficulty: "MEDIUM",
    title: "Sèrie de Fibonacci",
    pointsBase: 150,
    timeLimit: 30,
    payload: {
      question: "Quin nombre ve a continuació?",
      description: "Cada nombre és la suma dels dos anteriors",
      visual: "numbers",
      sequence: [1, 1, 2, 3, 5, 8, null],
      options: [
        { label: "11" },
        { label: "12" },
        { label: "13", emoji: "⭐" },
        { label: "14" },
      ],
      correctIndex: 2,
      hint: "Suma els dos últims nombres que veus",
    },
  },
  {
    id: "act-4",
    type: "ODD_ONE_OUT",
    difficulty: "MEDIUM",
    title: "El intrús",
    pointsBase: 150,
    timeLimit: 20,
    payload: {
      question: "Quin no hi pertany?",
      options: [
        { label: "Rosa", emoji: "🌹" },
        { label: "Margarida", emoji: "🌼" },
        { label: "Turó", emoji: "⛰️" },
        { label: "Tulipa", emoji: "🌷" },
      ],
      correctIndex: 2,
      hint: "La resta comparteix alguna cosa en comú...",
    },
  },

  // ── HARD (12-14 anys) ────────────────────────────────────────────────────
  {
    id: "act-5",
    type: "NUMBER_SERIES",
    difficulty: "HARD",
    title: "Sèrie de potències",
    pointsBase: 200,
    timeLimit: 35,
    payload: {
      question: "Troba el terme que falta",
      description: "Observa la relació entre nombres consecutius",
      visual: "numbers",
      sequence: [3, 9, null, 81, 243],
      options: [
        { label: "18" },
        { label: "24" },
        { label: "27", emoji: "⭐" },
        { label: "36" },
      ],
      correctIndex: 2,
      hint: "Cada terme és el triple de l'anterior",
    },
  },
  {
    id: "act-6",
    type: "MATH_SPEED",
    difficulty: "HARD",
    title: "Càlcul ràpid",
    pointsBase: 200,
    timeLimit: 15,
    payload: {
      question: "Resol tan ràpid com puguis",
      description: "17 × 8 − 36 = ?",
      options: [
        { label: "100", emoji: "💥" },
        { label: "108" },
        { label: "96" },
        { label: "100" },
      ],
      correctIndex: 0,
      hint: "Descompon: (17×8) = 136, i llavors resta 36",
    },
  },
];

// Selecciona activitats per franja d'edat
export function getActivitiesForAge(age: number): Activity[] {
  const difficulty =
    age <= 8 ? "EASY" : age <= 11 ? "MEDIUM" : "HARD";
  return DEMO_ACTIVITIES.filter((a) => a.difficulty === difficulty);
}
