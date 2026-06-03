"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client";

export default function VideoRoom({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = trpc.session.getToken.useQuery({ sessionId });

  if (isLoading || !data) return <div>Connectant a l'aula...</div>;

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={data.token}
      serverUrl={data.wsUrl}
      className="h-screen"
    >
      <VideoConference />
    </LiveKitRoom>
  );
}