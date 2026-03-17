import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("telemetry");
    const events = db.collection("events");

    // 1. Core Totals
    const totalEvents = await events.countDocuments();
    const uniqueUsers = await events.distinct("userId"); // Uses the new userId field

    // 2. Average Time to Interactive (TTI)
    const perfData = await events.aggregate([
      { $match: { type: "performance", "data.tti": { $exists: true } } },
      { $group: { _id: null, avgTTI: { $avg: "$data.tti" } } }
    ]).toArray();

    // 3. Top Pages (Filter for production only)
    const topPages = await events.aggregate([
      { $match: { type: "pageview" } },
      { $group: { _id: "$url", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    // 4. Aggregated Clicks (for Bar Chart)
    const topClicks = await events.aggregate([
      { $match: { type: "click" } },
      { $group: { _id: "$data.label", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { label: "$_id", count: 1, _id: 0 } }
    ]).toArray();

    // 5. Browser Breakdown
    const browsers = await events.aggregate([
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // 6. Recent Interaction Stream
    const recentClicks = await events.find({ type: "click" })
      .sort({ timestamp: -1 })
      .limit(12)
      .project({ 
        label: "$data.label", 
        userId: 1, 
        visitCount: 1, 
        timestamp: 1, 
        _id: 0 
      })
      .toArray();

    return NextResponse.json({
      totalEvents,
      uniqueUsers: uniqueUsers.length,
      avgTTI: Math.round(perfData[0]?.avgTTI || 0),
      topPages,
      topClicks,
      browsers,
      recentClicks,
      totalPages: topPages.length
    });

  } catch (e) {
    console.error("Dashboard API error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}