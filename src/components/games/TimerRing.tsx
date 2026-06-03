// src/components/games/TimerRing.tsx
// Rellotge circular animat per al temporitzador del joc

"use client";

interface TimerRingProps {
  timeLeft: number;
  total: number;
  urgent: boolean;
}

export function TimerRing({ timeLeft, total, urgent }: TimerRingProps) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / total) * circumference;

  const color = urgent ? "#FF5252" : timeLeft <= total * 0.4 ? "#FF9500" : "#43C6AC";

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        className="-rotate-90"
        style={{ position: "absolute" }}
      >
        {/* Track */}
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="#E5EEF6"
          strokeWidth="5"
        />
        {/* Progrés */}
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className={`
          text-base font-black z-10
          ${urgent ? "text-[#FF5252] animate-pulse" : "text-[#1A2B5F]"}
        `}
      >
        {timeLeft}
      </span>
    </div>
  );
}
