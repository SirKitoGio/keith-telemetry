"use client";
import React, { useEffect, useState } from 'react';
import { 
  Antenna, LayoutDashboard, Users, Phone, LogOut, AlertTriangle, TrendingUp,
  MousePointerClick, Globe, Activity 
} from 'lucide-react';
import styles from './dashboard.module.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// ── DESCRIPTIVE LABEL MAPPING ───────────────────────────────────────
const labelMap = {
  'resume_download_web': 'Developer Resume (PDF)',
  'resume_download_mobile': 'Mobile Resume (PDF)',
  'resume_download_data': 'Data Resume (PDF)',
  'project_view_kape4u': 'Kape4U Project Click',
  'project_view_coffee_pipeline': 'Coffee Analytics Click',
  'project_view_ihm_proto': 'IHM Prototype Click',
  'project_view_speirs_proto': 'Speirs Group Prototype Click',
  'github_hero': 'GitHub Link (Hero)',
  'linkedin_hero': 'LinkedIn Link (Hero)',
  'click_github': 'GitHub Link (General)',
  'click_linkedin': 'LinkedIn Link (General)'
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#13141a', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{label}</p>
        <p style={{ color: '#06b6d4' }}>Clicks: {payload[0].value}</p>
      </div>
    );
  }
  return null;
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
          <h1>
            <Antenna size={28} color="#06b6d4" /> Telemetry Access
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

  // Pre-calculate Total browsers for Donut Chart percentage
  const totalBrowsers = data?.browsers?.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const topBrowser = data?.browsers?.[0] || { _id: 'Unknown', count: 0 };
  const topBrowserPercent = Math.round((topBrowser.count / totalBrowsers) * 100);

  return (
    <div className={styles.appContainer}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>T</div>
          Trackie
        </div>
        
        <div className={styles.sidebarSection}>
          <div className={styles.sectionTitle}>Main</div>
          <div className={`${styles.navItem} ${styles.active}`}><LayoutDashboard size={16} /> Dashboard</div>
          <div className={styles.navItem}><Activity size={16} /> Trackers</div>
        </div>
        
        <div className={styles.sidebarSection}>
          <div className={styles.sectionTitle}>Integrations</div>
          <div className={styles.navItem}><Globe size={16} /> Websites</div>
        </div>
        
        <div className={styles.userProfile}>
          <div className={styles.avatar}>KS</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Keith Speirs</div>
            <div className={styles.userEmail}>keith@ad-telemetry.io</div>
          </div>
          <LogOut size={16} color="#8b92a5" style={{cursor: 'pointer'}} />
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className={styles.mainContent}>
        {/* Top Header */}
        <div className={styles.topHeader}>
          <div className={styles.pageTitleContainer}>
            <LayoutDashboard size={20} color="#8b92a5" />
            <span className={styles.pageTitle}>Dashboard</span>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.statusPill}>
              <span className={styles.statusDot}></span> Live Systems Operational
            </div>
            <button className={styles.primaryButton}>+ New Tracker</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statGrid}>
          <div className={styles.dashboardCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Unique Users</span>
              <div className={styles.statIconWrap}><Users size={14} /></div>
            </div>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{data?.uniqueUsers || '0'}</span>
              <span className={styles.trendGreen}>+3%</span>
            </div>
          </div>

          <div className={styles.dashboardCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Pages Tracked</span>
              <div className={styles.statIconWrap}><Globe size={14} /></div>
            </div>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{data?.totalPages || '0'}</span>
              <span className={styles.trendGreen}>Active</span>
            </div>
          </div>

          <div className={styles.dashboardCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Total Events</span>
              <div className={styles.statIconWrap}><Activity size={14} /></div>
            </div>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{data?.totalEvents ? data.totalEvents.toLocaleString() : '0'}</span>
              <span className={styles.trendGreen}>+12% vs LW</span>
            </div>
          </div>

          <div className={styles.dashboardCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Avg Load Time (TTI)</span>
              <div className={styles.statIconWrap}><TrendingUp size={14} /></div>
            </div>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{data?.avgTTI ? data.avgTTI : '0'}</span>
              <span className={styles.statUnit}>ms</span>
              <span className={styles.trendGreen}>Fast</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartSection}>
          
          {/* Bar Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h2 className={styles.chartTitle}>Event History & Volume</h2>
                <div className={styles.chartSubtitle}>30-day performance overview</div>
              </div>
              <div className={styles.timeFilters}>
                <div className={styles.timeFilter}>7D</div>
                <div className={`${styles.timeFilter} ${styles.active}`}>30D</div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: '220px', marginLeft: '-15px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.topClicks}>
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="displayName" hide />
                  <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Bar dataKey="count" fill="url(#cyanGradient)" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader} style={{ justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 className={styles.chartTitle}>Peak Hours</h2>
                <div className={styles.chartSubtitle}>Engagement distribution</div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: '180px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data?.browsers} 
                    dataKey="count" 
                    nameKey="_id" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="75%" 
                    outerRadius="90%" 
                    stroke="none" 
                    paddingAngle={0}
                    cornerRadius={0}
                  >
                    {data?.browsers?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#06b6d4', '#a855f7', '#1f2937', '#e2e8f0'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#13141a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.donutInfo}>
                <div className={styles.donutPercent}>{topBrowserPercent}%</div>
                <div className={styles.donutLabel}>{topBrowser._id}</div>
              </div>
            </div>
            
            <div className={styles.pieLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{backgroundColor: '#06b6d4'}}></div>
                45% AM
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{backgroundColor: '#a855f7'}}></div>
                30% PM
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{backgroundColor: '#1f2937'}}></div>
                25% Night
              </div>
            </div>
          </div>

        </div>

        {/* Interaction Stream Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
                Recent System Activity
              </h2>
            </div>
          </div>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Interaction Label</th>
                <th>User Identity</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Time</th>
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
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
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