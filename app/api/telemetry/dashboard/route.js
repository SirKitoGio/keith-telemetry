import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  // ── Simple auth check ──────────────────────────────────────────────
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("telemetry");
    const events = db.collection("events");

    // ── 1. Page views per day (last 30 days) ─────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsByDay = await events
      .aggregate([
        {
          $match: {
            type: "pageview",
            timestamp: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", count: 1 } },
      ])
      .toArray();

    // ── 2. Average load time per page ────────────────────────────────
    const loadTimes = await events
      .aggregate([
        { $match: { type: "performance" } },
        {
          $group: {
            _id: "$url",
            avgTTI: { $avg: "$data.tti" },
            avgDCL: { $avg: "$data.domContentLoaded" },
            avgLoad: { $avg: "$data.loadComplete" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            url: "$_id",
            avgTTI: { $round: ["$avgTTI", 0] },
            avgDCL: { $round: ["$avgDCL", 0] },
            avgLoad: { $round: ["$avgLoad", 0] },
            count: 1,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ])
      .toArray();

    // ── 3. Top clicked elements ──────────────────────────────────────
    const clicks = await events
      .aggregate([
        { $match: { type: "click" } },
        {
          $group: {
            _id: "$data.label",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, label: "$_id", count: 1 } },
      ])
      .toArray();

    // ── 4. Views by page URL ─────────────────────────────────────────
    const viewsByPage = await events
      .aggregate([
        { $match: { type: "pageview" } },
        {
          $group: {
            _id: "$url",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $project: { _id: 0, url: "$_id", count: 1 } },
      ])
      .toArray();

    // ── 5. Summary stats ─────────────────────────────────────────────
    const totalEvents = await events.countDocuments();
    const uniqueSessions = await events.distinct("sessionId");
    const avgTTIAll = await events
      .aggregate([
        { $match: { type: "performance", "data.tti": { $exists: true } } },
        { $group: { _id: null, avg: { $avg: "$data.tti" } } },
      ])
      .toArray();

    // ── 6. Browser breakdown ─────────────────────────────────────────
    const browsers = await events
      .aggregate([
        { $match: { type: "pageview" } },
        {
          $group: {
            _id: "$browser",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $project: { _id: 0, browser: "$_id", count: 1 } },
      ])
      .toArray();

    const stats = {
      totalEvents,
      uniqueSessions: uniqueSessions.length,
      avgTTI: avgTTIAll.length ? Math.round(avgTTIAll[0].avg) : 0,
    };

    return NextResponse.json({
      viewsByDay,
      loadTimes,
      clicks,
      viewsByPage,
      browsers,
      stats,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
