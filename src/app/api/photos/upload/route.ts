import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

interface UploadRequest {
  sessionId: string;
  participantId: string | null;
  sequence: number;
  image: string; // base64 string
  kind: "CAPTURE" | "COMPOSITE";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UploadRequest;
    const { sessionId, participantId, sequence, image, kind } = body;

    if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    if (participantId && !/^[0-9a-f-]{36}$/i.test(participantId)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 });
    }
    if (sequence < 1 || sequence > 8) {
      return NextResponse.json({ error: "Invalid sequence" }, { status: 400 });
    }
    if (!image || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data format" }, { status: 400 });
    }

    // 1. Fetch session to verify it exists and get room ID
    const sessions = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId} LIMIT 1
    `;
    if (sessions.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const session = sessions[0];

    // 2. Decode base64 image data
    const base64Data = image.split(",")[1];
    const imageBuffer = Buffer.from(base64Data, "base64");

    // 3. Construct filename path
    const fileExtension = "jpg";
    const filename = kind === "COMPOSITE" 
      ? `composite_${sequence}.${fileExtension}`
      : `participant_${participantId}_${sequence}.${fileExtension}`;
    
    const objectPath = `${session.room_id}/${sessionId}/${filename}`;

    // 4. Upload to Supabase Storage using Admin client
    const supabase = createAdminClient();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(objectPath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload failed:", uploadError);
      return NextResponse.json({ error: "Failed to upload image to storage" }, { status: 502 });
    }

    // 5. Insert into photos table in database
    const photos = await sql`
      INSERT INTO photos (session_id, participant_id, sequence, object_path, kind)
      VALUES (${sessionId}, ${participantId}, ${sequence}, ${objectPath}, ${kind})
      ON CONFLICT (object_path) 
      DO UPDATE SET created_at = now()
      RETURNING *
    `;

    // 6. Get signed URL for access (e.g. valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("photos")
      .createSignedUrl(objectPath, 3600); // 1 hour expiry

    if (urlError) {
      console.error("Failed to generate signed URL:", urlError);
      return NextResponse.json({ error: "Failed to create access URL" }, { status: 502 });
    }

    return NextResponse.json({
      photo: photos[0],
      url: urlData.signedUrl,
    }, { status: 201 });

  } catch (error) {
    console.error("Upload photo failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
