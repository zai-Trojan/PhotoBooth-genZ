import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CODE_WORDS = ["LOVE", "MOON", "DATE", "PINK", "TOYS", "HERO"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { hostId?: string; frameId?: string | null };
    if (!body.hostId || !/^[0-9a-f-]{36}$/i.test(body.hostId)) {
      return NextResponse.json({ error: "A valid host identity is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `${CODE_WORDS[randomInt(CODE_WORDS.length)]}-${randomInt(1000, 10000)}`;
      const { data, error } = await supabase
        .from("rooms")
        .insert({ code, host_id: body.hostId, frame_id: body.frameId ?? null })
        .select()
        .single();
      if (!error) return NextResponse.json({ room: data }, { status: 201 });
      if (error.code !== "23505") throw error;
    }
    return NextResponse.json({ error: "Could not allocate a room code" }, { status: 503 });
  } catch (error) {
    console.error("Create room failed", error);
    return NextResponse.json({ error: "Room service is unavailable" }, { status: 503 });
  }
}
