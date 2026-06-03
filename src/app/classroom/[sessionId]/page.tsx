// src/app/classroom/[sessionId]/page.tsx
// Aula virtual: video/àudio via LiveKit + pizarra tldraw
// Accessible per a nens, professors i (en el futur) pares en mode observador

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { ClassroomClient } from "@/components/classroom/ClassroomClient";

interface Props {
  params: { sessionId: string };
}

export default async function ClassroomPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const classSession = await db.classSession.findUnique({
    where: { id: params.sessionId },
    include: {
      booking: {
        include: {
          child: {
            include: { childProfile: { include: { user: true } } },
          },
        },
      },
      teacher: { include: { user: true } },
    },
  });

  if (!classSession) redirect("/");
  if (classSession.status === "ENDED") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-5xl">✅</span>
          <h1 className="text-xl font-bold text-gray-800 mt-4">
            Classe finalitzada
          </h1>
          <p className="text-gray-500 mt-2">Molt bona feina! Fins aviat.</p>
        </div>
      </main>
    );
  }

  const isTeacher = session.user.role === "TEACHER";

  return (
    <ClassroomClient
      sessionId={params.sessionId}
      userId={session.user.id}
      userName={session.user.name ?? "Usuari"}
      isTeacher={isTeacher}
      roomName={classSession.livekitRoom}
    />
  );
}
