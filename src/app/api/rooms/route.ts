import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const CODE_WORDS = ["LOVE", "MOON", "DATE", "PINK", "TOYS", "HERO"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { hostId?: string; frameId?: string | null };
    if (!body.hostId || !/^[0-9a-f-]{36}$/i.test(body.hostId)) {
      return NextResponse.json({ error: "A valid host identity is required" }, { status: 400 });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `${CODE_WORDS[randomInt(CODE_WORDS.length)]}-${randomInt(1000, 10000)}`;
      try {
        const rooms = await sql`
          INSERT INTO rooms (code, host_id, frame_id)
          VALUES (${code}, ${body.hostId}, ${body.frameId ?? null})
          RETURNING *
        `;
        if (rooms.length > 0) {
          return NextResponse.json({ room: rooms[0] }, { status: 201 });
        }
      } catch (error: any) {
        // Unique violation in Postgres is error code 23505
        if (error.code !== "23505") throw error;
      }
    }
    return NextResponse.json({ error: "Could not allocate a room code" }, { status: 503 });
  } catch (error) {
    console.error("Create room failed", error);
    return NextResponse.json({ error: "Room service is unavailable" }, { status: 503 });
  }
}

