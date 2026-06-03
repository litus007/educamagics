// src/app/(auth)/games/page.tsx
// Pàgina principal del mòdul de jocs de lògica
// Integra el selector d'edat, el repte del dia i el rànquing
// src/app/(auth)/child/games/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth"; 
import { db } from "@/lib/db";           
import { GamesClient } from "@/components/games/GamesClient";

// Definim una interfície local exactament com la de GamesClient per garantir compatibilitat de tipus
interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarKey: string;
  totalPoints: number;
  totalCorrect: number;
  currentStreak: number;
  isCurrentUser?: boolean;
}

export default async function GamesPage() {
  const session = await getServerSession(authOptions);
  
  // 1. Protecció de ruta (Només nens autenticats)
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CHILD") redirect("/login");

  // Forcem l'accés a db com a 'any' per ignorar el retard de sincronització de Prisma local
  const database = db as any;

  // 2. Petició de dades de jocs a la BD amb mètodes segurs
  const [topRanking, myRanking, totalPlayers] = await Promise.all([
    database.globalRanking?.findMany({
      take: 10,
      orderBy: { totalPoints: "desc" },
      include: { user: { select: { name: true } } },
    }) || [],
    database.globalRanking?.findUnique({
      where: { userId: session.user.id },
    }) || null,
    database.globalRanking?.count() || 0,
  ]);

  // 3. Estimar l'edat de l'estudiant de forma estàtica
  const estimatedAge = 9; 

  // 4. Mapejar les dades assegurant que quadren al 100% amb el tipus RankingEntry
  const rankingEntries: RankingEntry[] = (topRanking || []).map((r: any, i: number) => ({
    rank: i + 1,
    userId: String(r.userId),
    displayName: String(r.displayName ?? "Estudiant de Màgia"),
    avatarKey: String(r.avatarKey ?? "star"),
    totalPoints: Number(r.totalPoints ?? 0),
    totalCorrect: Number(r.totalCorrect ?? 0),
    currentStreak: Number(r.currentStreak ?? 0),
    isCurrentUser: r.userId === session.user.id,
  }));

  // Corregim que el rang mai sigui null per evitar línies vermelles a myRank
  const userRank = myRanking?.rank ?? undefined;

  return (
    <main 
      className="min-h-screen bg-cover bg-center p-4 md:p-8 flex flex-col justify-between"
      style={{ backgroundImage: "url('/fons-estiu.png')" }}
    >
      <div className="w-full max-w-5xl mx-auto flex-1">
        <GamesClient 
          userId={session.user.id}
          userName={session.user.name ?? "Amic"}
          estimatedAge={estimatedAge}
          ranking={rankingEntries}
          myRank={userRank}
          myPoints={myRanking?.totalPoints ?? 0}
          totalPlayers={totalPlayers}
        />
      </div>
    </main>
  );
}