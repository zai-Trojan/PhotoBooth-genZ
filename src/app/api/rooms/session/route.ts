import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface SessionRequest {
  roomId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SessionRequest;
    const { roomId } = body;

    if (!roomId || !/^[0-9a-f-]{36}$/i.test(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    // 1. Check if the room exists
    const rooms = await sql`
      SELECT * FROM rooms WHERE id = ${roomId} LIMIT 1
    `;
    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 2. Create the session
    const sessions = await sql`
      INSERT INTO sessions (room_id, status, started_at)
      VALUES (${roomId}, 'CREATED', now())
      RETURNING *
    `;

    // 3. Update room status to READY or CAPTURING
    await sql`
      UPDATE rooms SET status = 'READY' WHERE id = ${roomId}
    `;

    return NextResponse.json({
      session: sessions[0],
    }, { status: 201 });

  } catch (error) {
    console.error("Create session failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
