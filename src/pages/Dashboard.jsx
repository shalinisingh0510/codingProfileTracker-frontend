import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUserInfo, 
  getLeetCodeProfile, 
  getCodeforcesProfile, 
  getGfgProfile,
  getGithubProfile,
  getCodechefProfile,
  getHackerrankProfile,
  getHackerearthProfile
} from '../services/api';
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

const PlatformSection = ({ name, data, loading, color, icon, labels = {} }) => {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/30 p-6 md:p-8 rounded-[2rem] border border-gray-800 animate-pulse transition-all">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-900 rounded-lg"></div>
              <div className="h-2 w-16 bg-gray-900 rounded-lg"></div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-2 w-12 bg-gray-900 rounded-lg ml-auto"></div>
            <div className="h-5 w-16 bg-gray-900 rounded-lg"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30 h-16">
              <div className="h-1.5 w-10 bg-gray-900 rounded mb-2"></div>
              <div className="h-4 w-14 bg-gray-900 rounded"></div>
            </div>
          ))}
        </div>

        {/* Graph Skeleton */}
        <div className="grid grid-cols-2 gap-4 h-[120px]">
          <div className="bg-gray-900/20 rounded-xl"></div>
          <div className="bg-gray-900/20 rounded-xl"></div>
        </div>
      </div>
    );
  }

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
    <div className="bg-[#0f172a]/30 p-6 md:p-8 rounded-[2rem] border border-gray-800 transition-all hover:bg-[#0f172a]/40 hover:border-gray-700/50 animate-in fade-in zoom-in-95 duration-500">
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
          <span className="text-xl font-black text-emerald-400">{data.solvedThisYear || data.contributionsLastYear || data.badges?.length || data.problemsSolved || 0}</span>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">{currentLabels.max}</span>
          <span className="text-xl font-black text-gray-300">{data.maxRating || data.publicRepos || data.totalPoints || data.prestige || '---'}</span>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">{currentLabels.extra}</span>
          <span className="text-xl font-black text-indigo-400">{data.contestsAttended || data.totalPRs || data.globalRank || data.solvedCount || '---'}</span>
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

// ─── GitHub Hero Card (Full-Width) ───────────────────────────────────────────
const GitHubHeroCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="col-span-1 md:col-span-2 bg-[#0f172a]/30 p-8 md:p-10 rounded-[2rem] border border-gray-800 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-900 rounded-lg"></div>
            <div className="h-2 w-20 bg-gray-900 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gray-900/40 p-4 rounded-2xl h-16"></div>
          ))}
        </div>
        <div className="h-[160px] bg-gray-900/20 rounded-xl"></div>
      </div>
    );
  }

  if (!data || data.error) return null;

  const contributionChartData = {
    labels: data.contributionGraph?.map(g => g.date) || [],
    datasets: [
      {
        label: 'Contributions',
        data: data.contributionGraph?.map(g => g.count) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1,
        borderRadius: 3,
        barPercentage: 0.9,
        categoryPercentage: 0.95,
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
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          title: (ctx) => ctx[0]?.label || '',
          label: (ctx) => `${ctx.raw} contributions`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { display: false } },
      y: { grid: { color: 'rgba(51, 65, 85, 0.15)', drawBorder: false }, ticks: { color: '#475569', font: { size: 9 } }, beginAtZero: true }
    }
  };

  const stats = [
    { label: 'Total Contributions', value: data.totalContributions || 0, color: 'text-white' },
    { label: 'This Year', value: data.contributionsLastYear || 0, color: 'text-emerald-400' },
    { label: 'Repositories', value: data.publicRepos || 0, color: 'text-indigo-400' },
    { label: 'Pull Requests', value: data.totalPRs || 0, color: 'text-cyan-400' },
    { label: 'Issues', value: data.totalIssues || 0, color: 'text-amber-400' },
    { label: 'Followers', value: data.followers || 0, color: 'text-pink-400' },
  ];

  return (
    <div className="col-span-1 md:col-span-2 bg-[#0f172a]/30 p-8 md:p-10 rounded-[2rem] border border-indigo-500/20 transition-all hover:border-indigo-500/40 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-gray-800">
            🐙
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-indigo-400">GitHub</h3>
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">@{data.username || 'developer'}</p>
          </div>
        </div>
        {data.bio && (
          <p className="text-xs text-gray-500 italic max-w-md text-right hidden md:block">&ldquo;{data.bio}&rdquo;</p>
        )}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30 text-center">
            <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest block mb-1">{stat.label}</span>
            <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {data.achievements?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {data.achievements.map((ach, i) => (
            <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-amber-400">
              🏅 {ach}
            </span>
          ))}
        </div>
      )}

      <div className="h-[160px] bg-gray-900/20 rounded-xl overflow-hidden p-3">
        <Bar data={contributionChartData} options={chartOptions} />
      </div>
    </div>
  );
};

// ─── HackerRank Card (Enhanced with Badges & Certs) ──────────────────────────
const HackerRankCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/30 p-6 md:p-8 rounded-[2rem] border border-gray-800 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="h-5 w-24 bg-gray-900 rounded-lg"></div>
            <div className="h-2 w-16 bg-gray-900 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="bg-gray-900/40 p-4 rounded-2xl h-16"></div>)}
        </div>
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-900/40 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!data || data.error) return null;

  return (
    <div className="bg-[#0f172a]/30 p-6 md:p-8 rounded-[2rem] border border-green-500/20 transition-all hover:border-green-500/40 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-gray-800">
            🏁
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-green-400">HackerRank</h3>
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{data.rating || 'Active Explorer'}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Global Rank</span>
          <span className="text-lg font-black text-green-400">{data.globalRank || '---'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">Problems Solved</span>
          <span className="text-xl font-black text-white">{data.totalSolved || 0}</span>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">Total Points</span>
          <span className="text-xl font-black text-emerald-400">{data.totalPoints || 0}</span>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">Max Stars</span>
          <span className="text-xl font-black text-amber-400">{data.prestige || 0}★</span>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/30">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">Badges Earned</span>
          <span className="text-xl font-black text-indigo-400">{data.badges?.length || data.badgeNames?.length || 0}</span>
        </div>
      </div>

      {(data.badges?.length > 0 || data.badgeNames?.length > 0) && (
        <div className="mb-6">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Skill Badges</h4>
          <div className="flex flex-wrap gap-2">
            {(data.badges || []).map((badge, i) => (
              <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl text-[9px] font-bold text-green-400 flex items-center gap-1.5">
                <span className="text-amber-400">{typeof badge === 'object' ? '★'.repeat(badge.stars || 1) : '★'}</span>
                {typeof badge === 'object' ? badge.name : badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.certifications?.length > 0 && (
        <div>
          <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Certifications</h4>
          <div className="space-y-2">
            {data.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                <span className="text-cyan-400 text-sm">🎓</span>
                <div>
                  <span className="text-xs font-bold text-cyan-300 block">{cert.name}</span>
                  {cert.level && <span className="text-[8px] text-gray-500 uppercase tracking-widest">{cert.level}</span>}
                </div>
                <span className="ml-auto text-[7px] font-black uppercase tracking-widest text-emerald-500">{cert.status || 'Verified'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [handles, setHandles] = useState({});
  const [platforms, setPlatforms] = useState({});
  const [platformLoading, setPlatformLoading] = useState({});
  const [totalSolved, setTotalSolved] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlatformData = useCallback(async (platformName, handle, fetchFn) => {
    if (!handle) return;
    
    try {
      const data = await fetchFn(handle);
      setPlatforms(prev => ({ ...prev, [platformName]: data }));
      
      // Update total solved as data arrives
      const solvedCount = data.totalSolved || data.totalContributions || 0;
      if (solvedCount > 0) {
        setTotalSolved(prev => prev + solvedCount);
      }
    } catch (err) {
      console.error(`Error fetching ${platformName}:`, err);
      setPlatforms(prev => ({ ...prev, [platformName]: { error: true } }));
    } finally {
      setPlatformLoading(prev => ({ ...prev, [platformName]: false }));
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const userInfo = await getUserInfo();
        const userHandles = userInfo.handles || {};

        // Step 1: Pre-fill loading state for ALL active handles BEFORE clearing the global loader.
        // This guarantees skeletons are visible on the very first render.
        const initialLoadingState = {};
        if (userHandles.leetcode) initialLoadingState.leetcode = true;
        if (userHandles.codeforces) initialLoadingState.codeforces = true;
        if (userHandles.gfg) initialLoadingState.gfg = true;
        if (userHandles.github) initialLoadingState.github = true;
        if (userHandles.codechef) initialLoadingState.codechef = true;
        if (userHandles.hackerrank) initialLoadingState.hackerrank = true;
        if (userHandles.hackerearth) initialLoadingState.hackerearth = true;

        // Step 2: Set ALL state synchronously so React batches them into a single render.
        setUser(userInfo.user);
        setHandles(userHandles);
        setPlatformLoading(initialLoadingState);
        setLoading(false);

        // Step 3: Fire off all platform fetches in parallel.
        // Each will independently update `platforms` and clear its own loading flag.
        if (userHandles.leetcode) fetchPlatformData('leetcode', userHandles.leetcode, getLeetCodeProfile);
        if (userHandles.codeforces) fetchPlatformData('codeforces', userHandles.codeforces, getCodeforcesProfile);
        if (userHandles.gfg) fetchPlatformData('gfg', userHandles.gfg, getGfgProfile);
        if (userHandles.github) fetchPlatformData('github', userHandles.github, getGithubProfile);
        if (userHandles.codechef) fetchPlatformData('codechef', userHandles.codechef, getCodechefProfile);
        if (userHandles.hackerrank) fetchPlatformData('hackerrank', userHandles.hackerrank, getHackerrankProfile);
        if (userHandles.hackerearth) fetchPlatformData('hackerearth', userHandles.hackerearth, getHackerearthProfile);

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      initializeDashboard();
    }
  }, [navigate, fetchPlatformData]);

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
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-28 h-28 rounded-[2.5rem] border-2 border-cyan-500/30 p-1.5 object-cover shadow-2xl" />
            ) : (
              <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                {user?.name?.[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px w-8 bg-cyan-400"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">{user?.collegeName || 'Senior Architect'}</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-tight">
                {user?.name || 'Developer'}<span className="text-cyan-400">.</span>
              </h1>
              <div className="flex flex-wrap gap-2 mt-4">
                {user?.skills?.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex bg-[#0f172a]/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-gray-800 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
             <div className="text-center px-8 border-r border-gray-800">
               <span className="block text-5xl font-black text-white mb-2">{totalSolved || 0}</span>
               <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Aggregate Solved</span>
             </div>
             <div className="text-center px-8">
               <span className="block text-5xl font-black text-cyan-400 mb-2">{parseFloat((totalSolved / 365).toFixed(2))}</span>
               <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest whitespace-nowrap">Daily Velocity</span>
             </div>
          </div>
        </div>

        {/* Primary Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-600 mb-8 border-b border-gray-800 pb-4 flex items-center gap-4">
               Synced Platform Identities <span className="h-px flex-grow bg-gray-800"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub Hero Card - Full Width at the top */}
              {handles.github && (
                <GitHubHeroCard 
                  data={platforms.github} 
                  loading={platformLoading.github} 
                />
              )}

              {/* Regular Platform Cards */}
              {handles.leetcode && (
                <PlatformSection 
                  name="LeetCode" 
                  data={platforms.leetcode} 
                  loading={platformLoading.leetcode} 
                  color="text-yellow-500" 
                  icon="⚡" 
                  labels={{ recent: 'Active Days', extra: 'Contests' }}
                />
              )}
              {handles.codeforces && (
                <PlatformSection 
                  name="Codeforces" 
                  data={platforms.codeforces} 
                  loading={platformLoading.codeforces} 
                  color="text-red-500" 
                  icon="🏆" 
                  labels={{ rating: 'Current Rating', max: 'Max Rating', extra: 'Contests' }}
                />
              )}
              {handles.gfg && (
                <PlatformSection 
                  name="GfG" 
                  data={platforms.gfg} 
                  loading={platformLoading.gfg} 
                  color="text-emerald-500" 
                  icon="🌳" 
                  labels={{ recent: 'Score', extra: 'Global Rank' }}
                />
              )}
              {handles.codechef && (
                <PlatformSection 
                  name="CodeChef" 
                  data={platforms.codechef} 
                  loading={platformLoading.codechef} 
                  color="text-yellow-600" 
                  icon="👨‍🍳" 
                  labels={{ recent: 'Stars', rating: 'Rating', max: 'Max Stars', extra: 'Country Rank' }}
                />
              )}

              {/* HackerRank - Enhanced Card with Badges & Certs */}
              {handles.hackerrank && (
                <HackerRankCard 
                  data={platforms.hackerrank} 
                  loading={platformLoading.hackerrank} 
                />
              )}

              {handles.hackerearth && (
                <PlatformSection 
                  name="HackerEarth" 
                  data={platforms.hackerearth} 
                  loading={platformLoading.hackerearth} 
                  color="text-blue-400" 
                  icon="🌏" 
                  labels={{ recent: 'Checkins', rating: 'Contest Rating', max: 'Points', extra: 'Solved' }}
                />
              )}
            </div>

            {Object.values(handles).every(h => !h) && (

              <div className="text-center py-20 bg-gray-900/20 rounded-[3rem] border border-dashed border-gray-800">
                <p className="text-gray-500 font-medium mb-6 italic">No platform handles configured.</p>
                <button onClick={() => navigate('/profile')} className="px-8 py-3 bg-cyan-500 text-black font-black rounded-2xl transition-all">Setup Profiles</button>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
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

        <ResourceHub />

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
