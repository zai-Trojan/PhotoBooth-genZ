import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || request.headers.get("Authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET || "neamor_cleanup_default_secret_7382";

  if (token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting database & storage cleanup...");

    // 1. Find all photo paths of rooms created > 24 hours ago
    const expiredPhotos = await sql`
      SELECT p.object_path 
      FROM public.photos p
      JOIN public.sessions s ON p.session_id = s.id
      JOIN public.rooms r ON s.room_id = r.id
      WHERE r.created_at < now() - interval '24 hours'
    `;

    const pathsToDelete = expiredPhotos.map((row: any) => row.object_path);
    let storageDeletedCount = 0;

    if (pathsToDelete.length > 0) {
      console.log(`Found ${pathsToDelete.length} expired photos in Supabase Storage to delete.`);
      const supabase = createAdminClient();
      
      // Delete in chunks of 100 to avoid payload size/limit issues
      const chunkSize = 100;
      for (let i = 0; i < pathsToDelete.length; i += chunkSize) {
        const chunk = pathsToDelete.slice(i, i + chunkSize);
        const { data, error } = await supabase.storage
          .from("photos")
          .remove(chunk);
        
        if (error) {
          console.error("Failed to delete chunk of photos from Supabase Storage:", error);
        } else if (data) {
          storageDeletedCount += data.length;
        }
      }
    }

    // 2. Delete rooms created > 24 hours ago
    // Due to ON DELETE CASCADE constraints, this automatically deletes the rooms,
    // sessions, participants, and remaining photo database entries.
    const deletedRooms = await sql`
      DELETE FROM public.rooms 
      WHERE created_at < now() - interval '24 hours'
      RETURNING id
    `;

    console.log(`Cleanup completed successfully. Deleted ${deletedRooms.length} rooms and ${storageDeletedCount} files from Supabase Storage.`);

    return NextResponse.json({
      success: true,
      deletedRoomsCount: deletedRooms.length,
      deletedFilesCount: storageDeletedCount,
    });
  } catch (error: any) {
    console.error("Cleanup job failed:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
