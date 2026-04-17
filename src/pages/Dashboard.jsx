import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../services/api';
import AdBanner from '../components/AdBanner';
import ResourceHub from '../components/ResourceHub';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PlatformSection = ({ name, data, color, icon, labels = {} }) => {
  if (!data || data.error) return null;

  const defaultLabels = {
    total: 'Total Solved',
    recent: 'Solved (2024)',
    rating: 'Current Rating',
    max: 'Max Rating',
    extra: 'Contests'
  };

  const currentLabels = { ...defaultLabels, ...labels };

  const ratingChartData = {
    labels: data.ratingGraph?.map(g => g.date) || [],
    datasets: [
      {
        label: `${name} Rating`,
        data: data.ratingGraph?.map(g => g.rating) || [],
        borderColor: color.replace('text-', '').includes('yellow') ? '#f59e0b' : 
                    color.replace('text-', '').includes('red') ? '#ef4444' : '#22c55e',
        backgroundColor: color.replace('text-', '').includes('yellow') ? 'rgba(245, 158, 11, 0.1)' : 
                        color.replace('text-', '').includes('red') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 2,
      },
    ],
  };

  const solvedChartData = {
    labels: data.solvedGraph?.map(g => g.date) || data.contributionGraph?.map(g => g.date) || [],
    datasets: [
      {
        label: name === 'GitHub' ? 'Contributions' : 'Problems Solved',
        data: data.solvedGraph?.map(g => g.count) || data.contributionGraph?.map(g => g.count) || [],
        backgroundColor: color.replace('text-', '').includes('yellow') ? 'rgba(245, 158, 11, 0.6)' : 
                        color.replace('text-', '').includes('green') ? 'rgba(34, 197, 94, 0.6)' : 
                        color.replace('text-', '').includes('indigo') ? 'rgba(99, 102, 241, 0.6)' :
                        'rgba(239, 68, 68, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { display: false } },
      y: { grid: { color: 'rgba(51, 65, 85, 0.2)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 9 } } }
    }
  };

  return (
    <div className="bg-[#0f172a]/30 p-6 md:p-8 rounded-[2rem] border border-gray-800 transition-all hover:bg-[#0f172a]/40 hover:border-gray-700/50">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-gray-800">
            {icon}
          </div>
          <div>
            <h3 className={`text-2xl font-black tracking-tighter ${color}`}>{name}</h3>
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{data.rank || data.ranking || 'Active Explorer'}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{currentLabels.rating}</span>
          <span className={`text-lg font-black ${color}`}>{data.rating || data.followers || '---'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">{currentLabels.total}</span>
          <span className="text-xl font-black text-white">{data.totalSolved || data.totalContributions || 0}</span>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">{currentLabels.recent}</span>
          <span className="text-xl font-black text-emerald-400">{data.solvedThisYear || data.contributionsLastYear || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-[120px]">
        <div className="bg-gray-900/20 rounded-xl overflow-hidden p-2">
           <Line data={ratingChartData} options={chartOptions} />
        </div>
        <div className="bg-gray-900/20 rounded-xl overflow-hidden p-2">
           <Bar data={solvedChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="font-black tracking-[0.4em] uppercase text-[10px] text-cyan-500 animate-pulse">Initializing Deck</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] p-4 md:p-12 lg:p-20 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Modern Hero Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20 relative">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-8">
            {data?.user?.profilePic ? (
              <img src={data.user.profilePic} alt="Profile" className="w-28 h-28 rounded-[2.5rem] border-2 border-cyan-500/30 p-1.5 object-cover shadow-2xl" />
            ) : (
              <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                {data?.user?.name?.[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px w-8 bg-cyan-400"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">{data?.user?.collegeName || 'Senior Architect'}</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-tight">
                {data?.user?.name || 'Developer'}<span className="text-cyan-400">.</span>
              </h1>
              <div className="flex flex-wrap gap-2 mt-4">
                {data?.user?.skills?.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex bg-[#0f172a]/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-gray-800 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
             <div className="text-center px-8 border-r border-gray-800">
               <span className="block text-5xl font-black text-white mb-2">{data?.totalSolved || 0}</span>
               <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Solved</span>
             </div>
             <div className="text-center px-8">
               <span className="block text-5xl font-black text-cyan-400 mb-2">{data?.averageProblemsPerDay || 0}</span>
               <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest whitespace-nowrap">Daily Velocity</span>
             </div>
          </div>
        </div>

        {/* Primary Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Content Area - Platforms */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-600 mb-8 border-b border-gray-800 pb-4 flex items-center gap-4">
               Synced Platform Identities <span className="h-px flex-grow bg-gray-800"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.platforms?.leetcode && !data.platforms.leetcode.error && (
                <PlatformSection name="LeetCode" data={data.platforms.leetcode} color="text-yellow-500" icon="⚡" />
              )}
              {data?.platforms?.github && !data.platforms.github.error && (
                <PlatformSection name="GitHub" data={data.platforms.github} color="text-indigo-400" icon="🐙" />
              )}
              {data?.platforms?.codeforces && !data.platforms.codeforces.error && (
                <PlatformSection name="Codeforces" data={data.platforms.codeforces} color="text-red-500" icon="🏆" />
              )}
              {data?.platforms?.gfg && !data.platforms.gfg.error && (
                <PlatformSection name="GfG" data={data.platforms.gfg} color="text-emerald-500" icon="🌳" />
              )}
            </div>

            {Object.values(data?.platforms || {}).every(p => !p || p.error) && (
              <div className="text-center py-20 bg-gray-900/20 rounded-[3rem] border border-dashed border-gray-800">
                <p className="text-gray-500 font-medium mb-6 italic">No platform handles configured.</p>
                <button onClick={() => navigate('/profile')} className="px-8 py-3 bg-cyan-500 text-black font-black rounded-2xl transition-all">Setup Profiles</button>
              </div>
            )}
          </div>

          {/* Sidebar Area - Ads & Extras */}
          <div className="col-span-12 lg:col-span-4 sticky top-32 space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-600 mb-8 pb-4 border-b border-gray-800">Intelligence Sidebar</h2>
            <AdBanner />
            
            <div className="p-8 bg-[#0f172a]/20 border border-gray-800 rounded-[2rem]">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-6">Current Streak Tips</h4>
               <ul className="space-y-4">
                 {[
                   "Consistency beats intensity. Solve 1 daily.",
                   "Review solved problems every 7 days.",
                   "Document your approach on GitHub."
                 ].map((tip, i) => (
                   <li key={i} className="flex gap-4 text-xs group">
                     <span className="text-cyan-500 group-hover:scale-125 transition-transform">▹</span>
                     <span className="text-gray-400 leading-relaxed">{tip}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>

        {/* Global Resource Hub */}
        <ResourceHub />

        {/* Refined Footer */}
        <div className="mt-40 pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
           <p className="text-[9px] font-black uppercase tracking-[0.6em] text-gray-500">
             © 2026 CodeProfile Command Center . v3.0 Release
           </p>
           <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest">
             <span className="hover:text-cyan-400 cursor-pointer transition-colors">Documentation</span>
             <span className="hover:text-cyan-400 cursor-pointer transition-colors">System Status</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
