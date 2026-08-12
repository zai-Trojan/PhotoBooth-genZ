import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

interface TokenRequest {
  roomName?: string;
  participantName?: string;
  participantId?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !serverUrl) {
    return NextResponse.json({ error: "LiveKit is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as TokenRequest;
  const roomName = body.roomName?.trim().toUpperCase();
  const participantName = body.participantName?.trim().slice(0, 40);
  const participantId = body.participantId?.trim();
  if (!roomName || !/^[A-Z0-9-]{4,20}$/.test(roomName) || !participantName || !participantId) {
    return NextResponse.json({ error: "Invalid room or participant" }, { status: 400 });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    ttl: "10m",
  });
  token.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: false });

  return NextResponse.json({ token: await token.toJwt(), serverUrl });
}
