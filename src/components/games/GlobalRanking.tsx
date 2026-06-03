// src/components/games/GlobalRanking.tsx
// Taula de rànquing global estil gamificat estival
// Mostra TOP 10 + posició de l'usuari actual

// src/components/games/GlobalRanking.tsx
"use client";

export interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarKey: string;
  totalPoints: number;
  totalCorrect: number;
  currentStreak: number;
  isCurrentUser?: boolean;
}

interface Props {
  entries: RankingEntry[];
  currentUserRank?: number;
  totalPlayers?: number;
}

const AVATAR_EMOJI: Record<string, string> = {
  rocket: "🚀", wizard: "🧙", dragon: "🐲",
  star: "⭐", robot: "🤖", dino: "🦕",
  shark: "🦈", tiger: "🐯", alien: "👾", ninja: "🥷",
};

export function GlobalRanking({ entries, currentUserRank, totalPlayers }: Props) {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-xl max-w-2xl mx-auto space-y-6">
      
      {/* Capçalera informativa de la lliga d'estiu */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-sky-950">🏆 Lliga de Campions Educamagics</h2>
        <p className="text-xs font-bold text-sky-800/70">
          Suma punts completant reptes diaris de lògica · Total de jugadors: {totalPlayers || entries.length}
        </p>
      </div>

      {/* Llista de participants */}
      <div className="space-y-2 font-medium">
        {entries.map((entry) => {
          const isTop3 = entry.rank <= 3;
          
          // Disseny diferenciat per als líders o l'usuari actual
          let rowStyle = "bg-white/50 border-white/40";
          if (entry.isCurrentUser) {
            rowStyle = "bg-sky-100/80 border-sky-200 ring-2 ring-sky-400/30";
          } else if (isTop3) {
            rowStyle = "bg-white/80 border-amber-200/60";
          }

          return (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-sm transition-all hover:translate-x-1 ${rowStyle}`}
            >
              {/* Posició i Avatar */}
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-black text-sm ${
                  entry.rank === 1 ? "text-xl text-amber-500" :
                  entry.rank === 2 ? "text-xl text-slate-400" :
                  entry.rank === 3 ? "text-xl text-amber-700" : "text-sky-900/50"
                }`}>
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                </span>

                <div className="w-9 h-9 rounded-xl bg-sky-100/50 flex items-center justify-center text-xl shadow-inner">
                  {AVATAR_EMOJI[entry.avatarKey] ?? "⭐"}
                </div>

                {/* Nom i ratxa consecutiva */}
                <div>
                  <p className={`text-sm font-black ${entry.isCurrentUser ? "text-sky-600" : "text-sky-950"}`}>
                    {entry.displayName}
                    {entry.isCurrentUser && <span className="ml-1 text-[10px] bg-sky-600 text-white px-1.5 py-0.5 rounded-md font-bold">(Tu)</span>}
                  </p>
                  {entry.currentStreak > 1 && (
                    <p className="text-orange-600 text-[10px] font-bold flex items-center gap-0.5 mt-0.5">
                      🔥 {entry.currentStreak} dies seguits!
                    </p>
                  )}
                </div>
              </div>

              {/* Marcador de puntuació total */}
              <div className="text-right">
                <span className="text-sm font-black text-sky-950">{entry.totalPoints}</span>
                <span className="text-amber-500 text-xs ml-1">⭐</span>
                <p className="text-[10px] text-sky-800/40 font-bold">{entry.totalCorrect} encerts</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Targeta flotant resum inferior si l'usuari no és al Top 10 */}
      {currentUserRank && currentUserRank > 10 && (
        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">La teva posició global</p>
              <h4 className="text-sm font-black">Estàs al lloc número #{currentUserRank} del món</h4>
            </div>
          </div>
          <p className="text-xs font-black bg-white/20 px-3 py-1.5 rounded-xl">A por el Top 10! ✨</p>
        </div>
      )}

    </div>
  );
}
