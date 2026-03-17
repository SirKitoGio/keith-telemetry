import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Allow CORS so external sites can post events
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json();

    // ── Validate required fields ──────────────────────────────────────
    const required = ["type", "url", "timestamp", "sessionId"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const allowedTypes = ["pageview", "performance", "click"];
    if (!allowedTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid event type. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Insert into MongoDB ───────────────────────────────────────────
    const client = await clientPromise;
    const db = client.db("telemetry");

    const event = {
      type: body.type,
      url: body.url,
      timestamp: new Date(body.timestamp),
      sessionId: body.sessionId,
      browser: body.browser || "Unknown",
      resolution: body.resolution || "Unknown",
      data: body.data || {},
      receivedAt: new Date(),
    };

    await db.collection("events").insertOne(event);

    return NextResponse.json(
      { success: true },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
