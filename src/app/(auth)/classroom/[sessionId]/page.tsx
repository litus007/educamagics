import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { ClassroomClient } from "@/components/classroom/ClassroomClient";
import { redirect } from "next/navigation";

export default async function ClassroomPage({ params }: { params: { sessionId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Hem eliminat el roomName. No cal. El Client ja demana el token 
  // pel seu compte usant el sessionId i el backend retorna el token correcte.
  return (
    <ClassroomClient
      sessionId={params.sessionId}
      userId={session.user.id}
      userName={session.user.name || "Usuari"}
      isTeacher={session.user.role === "TEACHER"}
    />
  );
}