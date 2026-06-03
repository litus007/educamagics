// src/lib/livekit/token.ts
// Generació de tokens LiveKit per accedir a les sales
// El servidor mai exposa les claus al client

import { AccessToken, type VideoGrant } from "livekit-server-sdk";

interface TokenParams {
  roomName: string;       // livekitRoom del ClassSession
  participantId: string;  // userId
  participantName: string;
  isTeacher: boolean;
}

export async function createLiveKitToken({
  roomName,
  participantId,
  participantName,
  isTeacher,
}: TokenParams): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  // Permisos diferenciats per rol
  const videoGrant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,           // tots publiquen audio/video
    canSubscribe: true,
    canPublishData: true,       // necessari per a la pizarra
    // El professor pot publicar per a tots
    // Els alumnes NO es poden veure entre ells:
    // s'implementa amb permissions d'subscripció al backend de LiveKit
    // o amb tracks muted per defecte entre alumnes
    roomAdmin: isTeacher,       // el professor pot gestionar la sala
    hidden: false,
  };

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    ttl: "4h", // durada màxima de la sessió
  });

  token.addGrant(videoGrant);

  return await token.toJwt();
}
