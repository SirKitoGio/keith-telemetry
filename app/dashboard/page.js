"use client";
import React, { useEffect, useState } from 'react';
import { Antenna, LayoutDashboard, MousePointerClick, Globe, Activity } from 'lucide-react';
import styles from './dashboard.module.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// ── DESCRIPTIVE LABEL MAPPING ───────────────────────────────────────
// Translates technical IDs into human-readable descriptions
const labelMap = {
  // Resumes
  'resume_download_web': 'Developer Resume (PDF)',
  'resume_download_mobile': 'Mobile Resume (PDF)',
  'resume_download_data': 'Data Resume (PDF)',
  // Projects
  'project_view_kape4u': 'Kape4U Project Click',
  'project_view_coffee_pipeline': 'Coffee Analytics Click',
  'project_view_ihm_proto': 'IHM Prototype Click',
  'project_view_speirs_proto': 'Speirs Group Prototype Click',
  // Socials/Nav
  'github_hero': 'GitHub Link (Hero)',
  'linkedin_hero': 'LinkedIn Link (Hero)',
  'click_github': 'GitHub Link (General)',
  'click_linkedin': 'LinkedIn Link (General)'
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (e) => {
    if (e) e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/telemetry/dashboard', {
        headers: { 'Authorization': password }
      });
      if (res.ok) {
        const result = await res.json();
        const translatedClicks = result.topClicks.map(item => ({
          ...item,
          displayName: labelMap[item.label] || item.label 
        }));
        setData({ ...result, topClicks: translatedClicks });
        setIsAuthorized(true);
      } else if (res.status === 401) {
        setError('Invalid System Password');
      } else {
        setError('Failed to authenticate');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Network error occurred');
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized, password]);

  if (!isAuthorized) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className={styles.livePulse || ''}><Antenna size={28} /></span> Telemetry Access
          </h1>
          <p>Please authenticate to access the live telemetry system.</p>
          <form onSubmit={fetchData}>
            <input 
              type="password" 
              placeholder="System Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className={styles.loginError}>{error}</p>}
            <button type="submit">
              Authenticate System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header element to replace the basic padding */}
      <div className={styles.header}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LayoutDashboard size={24} /> Dashboard</h1>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot}></span>
          LIVE FEED ACTIVE
        </div>
      </div>

      {/* Header Stats */}
      <div className={styles.statGrid}>
        {[
          { label: 'Total Events', val: data?.totalEvents },
          { label: 'Unique Users', val: data?.uniqueUsers },
          { label: 'Avg TTI', val: data?.avgTTI ? `${data.avgTTI}` : '0', suffix: 'ms' },
          { label: 'Pages Tracked', val: data?.totalPages }
        ].map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>
              {stat.val || 0}
              {stat.suffix && <span className={styles.statSuffix}>{stat.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className={styles.chartGrid}>
        {/* Descriptive Engagement Chart */}
        <div className={styles.chartCard}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MousePointerClick size={20} color="#3b82f6" /> Most Engaging Content</h2>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topClicks} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="displayName" type="category" width={150} tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Pie Chart */}
        <div className={styles.chartCard}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={20} color="#10b981" /> Browser Distribution</h2>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.browsers} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" paddingAngle={5}>
                  {data?.browsers?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interaction Stream Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} color="#8b5cf6" /> Interaction Stream</h2>
            <p className={styles.tableSubtitle}>Real-time behavior sequence</p>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Interaction Label</th>
                <th>User Identity</th>
                <th>Status</th>
                <th className={styles.tableTime}>Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentClicks?.map((click, idx) => (
                <tr key={idx}>
                  <td className={styles.tableLabel}>
                    {labelMap[click.label] || click.label}
                  </td>
                  <td className={styles.tableUser}>
                    {click.userId}
                  </td>
                  <td>
                    <span className={styles.tableStatusBadge}>
                      VISIT_{click.visitCount || 1}
                    </span>
                  </td>
                  <td className={styles.tableTime}>
                    {new Date(click.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {(!data?.recentClicks || data.recentClicks.length === 0) && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No recent interactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;