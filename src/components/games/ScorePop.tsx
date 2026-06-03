// src/components/games/ScorePop.tsx
// Puntuació flotant animada quan s'encerta una resposta

"use client";

import { useEffect, useState } from "react";

export function ScorePop({ points }: { points: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2
                 text-3xl font-black text-[#FF9500] drop-shadow-lg
                 animate-score-pop"
      style={{
        textShadow: "0 2px 8px rgba(255,149,0,0.5)",
        animation: "scorePop 2s ease-out forwards",
      }}
    >
      +{points} ⭐
      <style>{`
        @keyframes scorePop {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(0.5); }
          30%  { opacity: 1; transform: translateX(-50%) translateY(-20px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(1); }
        }
      `}</style>
    </div>
  );
}
