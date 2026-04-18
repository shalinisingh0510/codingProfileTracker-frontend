import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getPublicProfile,
  getLeetCodeProfile, 
  getCodeforcesProfile, 
  getGfgProfile,
  getGithubProfile,
  getCodechefProfile,
  getHackerrankProfile,
  getHackerearthProfile
} from '../services/api';
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
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// ─── Compact Platform Card ──────────────────────────────────
const PlatformCard = ({ name, data, loading, color, icon }) => {
  if (loading) {
    return (
      <div className="bg-[#0f172a]/30 p-6 rounded-2xl border border-gray-800 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-900 rounded-xl"></div>
          <div className="h-4 w-20 bg-gray-900 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1,2].map(i => <div key={i} className="h-14 bg-gray-900/40 rounded-xl"></div>)}
        </div>
      </div>
    );
  }
  if (!data || data.error) return null;

  return (
    <div className="bg-[#0f172a]/30 p-6 rounded-2xl border border-gray-800 hover:border-gray-700/50 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className={`text-lg font-black tracking-tight ${color}`}>{name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-900/40 p-3 rounded-xl">
          <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest block">Total Solved</span>
          <span className="text-lg font-black text-white">{data.totalSolved || data.totalContributions || 0}</span>
        </div>
        <div className="bg-gray-900/40 p-3 rounded-xl">
          <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest block">Rating</span>
          <span className={`text-lg font-black ${color}`}>{data.rating || data.followers || '---'}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Public Dashboard Page ──────────────────────────────────
const PublicDashboard = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [platforms, setPlatforms] = useState({});
  const [platformLoading, setPlatformLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlatformData = useCallback(async (platformName, handle, fetchFn) => {
    if (!handle) return;
    try {
      const data = await fetchFn(handle);
      setPlatforms(prev => ({ ...prev, [platformName]: data }));
    } catch (err) {
      setPlatforms(prev => ({ ...prev, [platformName]: { error: true } }));
    } finally {
      setPlatformLoading(prev => ({ ...prev, [platformName]: false }));
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getPublicProfile(username);
        setProfile(data);

        // Pre-fill loading states
        const handles = data.handles || {};
        const initLoading = {};
        Object.keys(handles).forEach(k => { if (handles[k]) initLoading[k] = true; });
        setPlatformLoading(initLoading);
        setLoading(false);

        // Fetch platform data in parallel
        if (handles.leetcode) fetchPlatformData('leetcode', handles.leetcode, getLeetCodeProfile);
        if (handles.codeforces) fetchPlatformData('codeforces', handles.codeforces, getCodeforcesProfile);
        if (handles.gfg) fetchPlatformData('gfg', handles.gfg, getGfgProfile);
        if (handles.github) fetchPlatformData('github', handles.github, getGithubProfile);
        if (handles.codechef) fetchPlatformData('codechef', handles.codechef, getCodechefProfile);
        if (handles.hackerrank) fetchPlatformData('hackerrank', handles.hackerrank, getHackerrankProfile);
        if (handles.hackerearth) fetchPlatformData('hackerearth', handles.hackerearth, getHackerearthProfile);

      } catch (err) {
        setError(err.response?.status === 404 ? 'User not found' : 'Failed to load profile');
        setLoading(false);
      }
    };
    loadProfile();
  }, [username, fetchPlatformData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="font-black tracking-[0.4em] uppercase text-[10px] text-cyan-500 animate-pulse">Loading @{username}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-black text-gray-700 mb-4">404</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-2xl">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handles = profile?.handles || {};
  const githubData = platforms.github;

  // GitHub contribution chart
  const ghChartData = {
    labels: githubData?.contributionGraph?.map(g => g.date) || [],
    datasets: [{
      label: 'Contributions',
      data: githubData?.contributionGraph?.map(g => g.count) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderRadius: 3,
    }],
  };
  const ghChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', padding: 10, cornerRadius: 8, displayColors: false } },
    scales: { x: { display: false }, y: { grid: { color: 'rgba(51,65,85,0.15)' }, ticks: { color: '#475569', font: { size: 9 } }, beginAtZero: true } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] p-4 md:p-12 lg:p-20 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 relative">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          {profile?.profilePic ? (
            <img src={profile.profilePic} alt="" className="w-28 h-28 rounded-[2.5rem] border-2 border-cyan-500/30 p-1.5 object-cover shadow-2xl relative z-10" />
          ) : (
            <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl relative z-10">
              {profile?.name?.[0]}
            </div>
          )}
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-8 bg-cyan-400"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
                @{profile?.username} {profile?.collegeName && `• ${profile.collegeName}`}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
              {profile?.name}<span className="text-cyan-400">.</span>
            </h1>
            {profile?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* GitHub Hero (if present) */}
        {handles.github && (
          <div className="bg-[#0f172a]/30 p-8 rounded-[2rem] border border-indigo-500/20 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl">🐙</span>
              <div>
                <h3 className="text-2xl font-black text-indigo-400">GitHub</h3>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">@{githubData?.username || handles.github}</p>
              </div>
            </div>
            
            {platformLoading.github ? (
              <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-gray-900/40 rounded-xl"></div>)}
                </div>
                <div className="h-[140px] bg-gray-900/20 rounded-xl"></div>
              </div>
            ) : githubData && !githubData.error ? (
              <>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                  {[
                    { label: 'Contributions', value: githubData.totalContributions || 0, color: 'text-white' },
                    { label: 'This Year', value: githubData.contributionsLastYear || 0, color: 'text-emerald-400' },
                    { label: 'Repos', value: githubData.publicRepos || 0, color: 'text-indigo-400' },
                    { label: 'PRs', value: githubData.totalPRs || 0, color: 'text-cyan-400' },
                    { label: 'Issues', value: githubData.totalIssues || 0, color: 'text-amber-400' },
                    { label: 'Followers', value: githubData.followers || 0, color: 'text-pink-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-900/40 p-3 rounded-xl text-center">
                      <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest block mb-1">{s.label}</span>
                      <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[140px] bg-gray-900/20 rounded-xl overflow-hidden p-3">
                  <Bar data={ghChartData} options={ghChartOptions} />
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {handles.leetcode && <PlatformCard name="LeetCode" data={platforms.leetcode} loading={platformLoading.leetcode} color="text-yellow-500" icon="⚡" />}
          {handles.codeforces && <PlatformCard name="Codeforces" data={platforms.codeforces} loading={platformLoading.codeforces} color="text-red-500" icon="🏆" />}
          {handles.gfg && <PlatformCard name="GfG" data={platforms.gfg} loading={platformLoading.gfg} color="text-emerald-500" icon="🌳" />}
          {handles.codechef && <PlatformCard name="CodeChef" data={platforms.codechef} loading={platformLoading.codechef} color="text-yellow-600" icon="👨‍🍳" />}
          {handles.hackerrank && <PlatformCard name="HackerRank" data={platforms.hackerrank} loading={platformLoading.hackerrank} color="text-green-400" icon="🏁" />}
          {handles.hackerearth && <PlatformCard name="HackerEarth" data={platforms.hackerearth} loading={platformLoading.hackerearth} color="text-blue-400" icon="🌏" />}
        </div>

        {Object.values(handles).every(h => !h) && (
          <div className="text-center py-20 bg-gray-900/20 rounded-[3rem] border border-dashed border-gray-800 mt-8">
            <p className="text-gray-500 italic">This user hasn't added any coding profiles yet.</p>
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-gray-800 text-center opacity-40">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-gray-500">
            CodeProfile Tracker • Public Profile • @{username}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
