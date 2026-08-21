import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface TestimonialRequest {
  name?: string;
  message: string;
  rating: number;
}

export async function GET() {
  try {
    const list = await sql`
      SELECT id, name, message, rating, created_at 
      FROM testimonials 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    return NextResponse.json({ testimonials: list });
  } catch (error) {
    console.error("Failed to fetch testimonials", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestimonialRequest;
    let { name, message, rating } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Clean and truncate inputs
    const cleanedMessage = message.replace(/<[^>]*>/g, "").trim().slice(0, 200);
    const cleanedName = (name?.trim() || "Anonim").replace(/<[^>]*>/g, "").slice(0, 30);
    const ratingNum = Math.floor(Number(rating));

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO testimonials (name, message, rating)
      VALUES (${cleanedName}, ${cleanedMessage}, ${ratingNum})
      RETURNING *
    `;

    return NextResponse.json({ testimonial: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
