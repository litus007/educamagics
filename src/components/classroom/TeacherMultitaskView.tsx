// src/components/classroom/TeacherMultitaskView.tsx
// Vista multitasca del professor:
// - Mosaic de vídeos de tots els alumnes
// - Pot seleccionar amb qui parlar (1 a 1 o tots)
// - Cada alumne veu/sent NOMÉS el professor (aïllament)

"use client";

import { useParticipants, useLocalParticipant, useDataChannel } from "@livekit/components-react";
import { type RemoteParticipant } from "livekit-client";
import { useState, useCallback } from "react";
import { Whiteboard } from "./Whiteboard";

interface Props {
  sessionId: string;
}

export function TeacherMultitaskView({ sessionId }: Props) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [activeTab, setActiveTab] = useState<"mosaic" | "whiteboard">("mosaic");
  const { send, message } = useDataChannel("whiteboard");

  // Funció wrapper per netejar l'error de tipus
  const handleSend = useCallback((data: Uint8Array) => {
    send(data, { reliable: true });
  }, [send]);

  const students = participants.filter((p) => p.identity !== localParticipant?.identity) as RemoteParticipant[];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
       {/* ... botons i resta del contingut ... */}
       {activeTab === "whiteboard" && (
          <div className="flex-1">
            <Whiteboard
              onDataSend={handleSend}
              incomingData={message?.payload instanceof Uint8Array ? message.payload : undefined}
              isTeacher={true}
            />
          </div>
       )}
    </div>
  );
}