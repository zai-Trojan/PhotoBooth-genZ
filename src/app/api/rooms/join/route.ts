import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface JoinRequest {
  roomCode: string;
  userId: string;
  name: string;
  role: "HOST" | "GUEST";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JoinRequest;
    const { roomCode, userId, name, role } = body;

    if (!roomCode || !/^[A-Z0-9-]{4,20}$/i.test(roomCode)) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }
    if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    if (!name || name.trim().length === 0 || name.length > 40) {
      return NextResponse.json({ error: "Name must be between 1 and 40 characters" }, { status: 400 });
    }
    if (role !== "HOST" && role !== "GUEST") {
      return NextResponse.json({ error: "Invalid participant role" }, { status: 400 });
    }

    const uppercaseCode = roomCode.trim().toUpperCase();

    // 1. Find the room
    const rooms = await sql`
      SELECT * FROM rooms 
      WHERE code = ${uppercaseCode} AND status <> 'EXPIRED'
      LIMIT 1
    `;

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found or expired" }, { status: 404 });
    }

    const room = rooms[0];

    // 2. Register/Upsert participant
    const participants = await sql`
      INSERT INTO participants (room_id, user_id, name, role, status)
      VALUES (${room.id}, ${userId}, ${name.trim()}, ${role}, 'JOINED')
      ON CONFLICT (room_id, user_id) 
      DO UPDATE SET name = EXCLUDED.name, status = 'JOINED', last_seen_at = now()
      RETURNING *
    `;

    const participant = participants[0];

    return NextResponse.json({
      room,
      participant,
    }, { status: 200 });

  } catch (error) {
    console.error("Join room failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
