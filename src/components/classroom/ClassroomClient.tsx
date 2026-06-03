// src/components/classroom/ClassroomClient.tsx
// Aula virtual: client LiveKit + pizarra tldraw sincronitzada via DataChannel

"use client";

import {
  LiveKitRoom,
  VideoConference,
  useDataChannel,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useCallback, useState } from "react";
import { trpc } from "@/lib/trpc/client"; // Assegura't de fer servir el teu nou client
import { TeacherMultitaskView } from "./TeacherMultitaskView";
import { Whiteboard } from "./Whiteboard";

interface Props {
  sessionId: string;
  userId: string;
  userName: string;
  isTeacher: boolean;
  }

export function ClassroomClient({
  sessionId,
  userId,
  userName,
  isTeacher,
  }: Props) {
  const { data, isLoading, error } = trpc.session.getToken.useQuery({ sessionId });

  if (isLoading) return <div>Connectant...</div>;
  if (error || !data) return <div>Error en connectar.</div>;

  return (
    <LiveKitRoom
      token={data.token}
      serverUrl={data.wsUrl}
      connect={true}
      video={true}
      audio={true}
      className="min-h-screen bg-gray-950"
      onDisconnected={() => (window.location.href = isTeacher ? "/teacher" : "/child")}
    >
      {isTeacher ? (
        <TeacherMultitaskView sessionId={sessionId} />
      ) : (
        <StudentView userName={userName} />
      )}
    </LiveKitRoom>
  );
}

function StudentView({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<"video" | "whiteboard">("video");
  const { send, message } = useDataChannel("whiteboard");

  // Aquesta és la funció que elimina l'error de tipus
  const handleSend = useCallback((data: Uint8Array) => {
    send(data, { reliable: true });
  }, [send]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <div className="flex p-4 gap-2">
        <button onClick={() => setActiveTab("video")}>Vídeo</button>
        <button onClick={() => setActiveTab("whiteboard")}>Pissarra ✏️</button>
      </div>
      <div className="flex-1 relative">
        {activeTab === "video" && <VideoConference />}
        {activeTab === "whiteboard" && (
          <Whiteboard
            onDataSend={handleSend}
            incomingData={message?.payload instanceof Uint8Array ? message.payload : undefined}
            isTeacher={false}
          />
        )}
      </div>
    </div>
  );
}
