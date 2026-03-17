"use client";
import React, { useEffect, useState } from 'react';
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

  const fetchData = async () => {
    try {
      const res = await fetch('/api/telemetry/dashboard', {
        headers: { 'Authorization': password }
      });
      if (res.ok) {
        const result = await res.json();
        // Translate chart labels before rendering
        const translatedClicks = result.topClicks.map(item => ({
          ...item,
          displayName: labelMap[item.label] || item.label 
        }));
        setData({ ...result, topClicks: translatedClicks });
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl">
          <h1 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="animate-pulse">📡</span> Telemetry Access
          </h1>
          <input 
            type="password" 
            placeholder="System Password"
            className="w-full bg-black border border-slate-700 p-3 rounded mb-4 text-white focus:border-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={fetchData}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-all active:scale-95"
          >
            Authenticate System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8 font-mono">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', val: data?.totalEvents, color: 'text-white' },
          { label: 'Unique Users', val: data?.uniqueUsers, color: 'text-blue-500' },
          { label: 'Avg TTI', val: `${data?.avgTTI}ms`, color: 'text-green-500' },
          { label: 'Pages Tracked', val: data?.totalPages, color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.val || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Descriptive Engagement Chart */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-white font-bold mb-6 flex items-center gap-2">
            <span className="text-blue-500">🖱️</span> Most Engaging Content
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topClicks} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="displayName" type="category" width={150} tick={{fontSize: 9, fill: '#64748b'}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '8px'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Pie Chart */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-white font-bold mb-6">🌐 Browser Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.browsers} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none">
                  {data?.browsers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interaction Stream Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">📡 Interaction Stream</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">Real-time behavior sequence</p>
          </div>
          <div className="flex gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <span className="text-[10px] font-bold">LIVE_FEED</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black text-slate-500 uppercase text-[9px] font-black">
              <tr>
                <th className="px-6 py-4">Interaction Label</th>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.recentClicks.map((click, idx) => (
                <tr key={idx} className="hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">
                    {labelMap[click.label] || click.label}
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-blue-400">
                    {click.userId}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold">
                      VISIT_{click.visitCount || 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-right">
                    {new Date(click.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;