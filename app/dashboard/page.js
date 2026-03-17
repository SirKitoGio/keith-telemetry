"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import styles from "./dashboard.module.css";

const COLORS = ["#3b82f6", "#60a5fa", "#94a3b8", "#64748b", "#38bdf8", "#475569", "#93c5fd", "#cbd5e1"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "rgba(15, 17, 23, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px",
        padding: "0.6rem 1rem",
        fontSize: "0.85rem",
        color: "#e0e0e0",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    setError("");
    onLogin(password.trim());
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.loginContainer}>
        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <h1>📡 Telemetry</h1>
          <p>Enter your dashboard password to continue</p>
          <input
            type="password"
            placeholder="Dashboard password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit">Unlock Dashboard</button>
          {error && <p className={styles.loginError}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function DashboardPage() {
  const [apiKey, setApiKey] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(
    async (key) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/telemetry/dashboard", {
          headers: { "x-api-key": key || apiKey },
        });
        if (res.status === 401) {
          setApiKey(null);
          setError("Invalid password. Please try again.");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [apiKey]
  );

  const handleLogin = (password) => {
    setApiKey(password);
    fetchData(password);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!apiKey) return;
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [apiKey, fetchData]);

  if (!apiKey) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading && !data) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading telemetry data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading} style={{ color: "#ff6b6b" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { viewsByDay, loadTimes, clicks, viewsByPage, browsers, stats } = data;

  // Shorten URLs for display
  const shortenUrl = (url) => {
    try {
      const u = new URL(url);
      return u.pathname === "/" ? u.hostname : u.pathname;
    } catch {
      return url;
    }
  };

  const loadTimesDisplay = loadTimes.map((lt) => ({
    ...lt,
    shortUrl: shortenUrl(lt.url),
  }));

  const viewsByPageDisplay = viewsByPage.map((v) => ({
    ...v,
    shortUrl: shortenUrl(v.url),
  }));

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>📡 Telemetry Dashboard</h1>
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            Live — refreshes every 30s
          </span>
        </div>
        <button onClick={() => fetchData()}>↻ Refresh Now</button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Events</div>
          <div className={styles.statValue}>
            {stats.totalEvents.toLocaleString()}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Unique Sessions</div>
          <div className={styles.statValue}>
            {stats.uniqueSessions.toLocaleString()}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Time to Interactive</div>
          <div className={styles.statValue}>
            {stats.avgTTI}
            <span className={styles.statSuffix}>ms</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pages Tracked</div>
          <div className={styles.statValue}>{viewsByPage.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartGrid}>
        {/* Views Over Time */}
        <div className={styles.chartCard}>
          <h2>📈 Page Views Over Time</h2>
          {viewsByDay.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No pageview data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#3b82f6" }}
                  activeDot={{ r: 6, fill: "#60a5fa" }}
                  name="Views"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Load Times */}
        <div className={styles.chartCard}>
          <h2>⚡ Avg Load Time by Page (ms)</h2>
          {loadTimes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No performance data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={loadTimesDisplay} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="shortUrl"
                  stroke="#666"
                  fontSize={12}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgTTI" fill="#60a5fa" name="TTI" radius={[0, 6, 6, 0]} />
                <Bar dataKey="avgDCL" fill="#3b82f6" name="DCL" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Most Clicked */}
        <div className={styles.chartCard}>
          <h2>🖱️ Most Clicked Elements</h2>
          {clicks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No click data yet</p>
              <p style={{ fontSize: "0.8rem" }}>
                Add <code>data-track=&quot;label&quot;</code> to elements
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={clicks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Clicks" radius={[6, 6, 0, 0]}>
                  {clicks.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Browser Breakdown */}
        <div className={styles.chartCard}>
          <h2>🌐 Browser Breakdown</h2>
          {browsers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No browser data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={browsers}
                  dataKey="count"
                  nameKey="browser"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ browser, percent }) =>
                    `${browser} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#555" }}
                  fontSize={12}
                >
                  {browsers.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Pages */}
        <div className={styles.chartCard} style={{ gridColumn: "1 / -1" }}>
          <h2>📄 Top Pages by Views</h2>
          {viewsByPage.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No page data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={viewsByPageDisplay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="shortUrl" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Views" radius={[6, 6, 0, 0]}>
                  {viewsByPageDisplay.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
