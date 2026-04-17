import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../services/api';
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
  if (!data || data.error) {
    return (
      <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700/50 text-center mb-8">
        <h2 className={`text-2xl font-black mb-2 flex items-center justify-center gap-3 ${color}`}>
          {icon} {name}
        </h2>
        <p className="text-gray-500">No profile found or data unavailable for this platform.</p>
      </div>
    );
  }

  const defaultLabels = {
    total: 'Total Solved',
    recent: 'Solved (2024)',
    rating: 'Current Rating',
    max: 'Max Rating',
    extra: 'Contests'
  };

  const currentLabels = { ...defaultLabels, ...labels };

  // Rating Graph Data
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
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  // Solving Graph Data
  const solvedChartData = {
    labels: data.solvedGraph?.map(g => g.date) || data.contributionGraph?.map(g => g.date) || [],
    datasets: [
      {
        label: name === 'GitHub' ? 'Contributions' : 'Problems Solved',
        data: data.solvedGraph?.map(g => g.count) || data.contributionGraph?.map(g => g.count) || [],
        backgroundColor: color.replace('text-', '').includes('yellow') ? 'rgba(245, 158, 11, 0.8)' : 
                        color.replace('text-', '').includes('green') ? 'rgba(34, 197, 94, 0.8)' : 
                        color.replace('text-', '').includes('indigo') ? 'rgba(99, 102, 241, 0.8)' :
                        'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
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
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: 'rgba(51, 65, 85, 0.4)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } }
    }
  };

  return (
    <div className="bg-gray-800/40 p-6 md:p-10 rounded-[2.5rem] border border-gray-800 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:border-gray-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner border border-gray-800">
            {icon}
          </div>
          <div>
            <h2 className={`text-4xl font-black tracking-tighter ${color}`}>
              {name}
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">{data.rank || data.ranking || 'Newbie'}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <div className="bg-gray-900/80 px-6 py-3 rounded-2xl border border-gray-800 text-center">
             <span className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{currentLabels.rating}</span>
             <span className={`text-xl font-black ${color}`}>{data.rating || data.followers || '---'}</span>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800/50 group hover:bg-gray-900 transition-colors">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">{currentLabels.total}</span>
          <span className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{data.totalSolved || data.totalContributions || 0}</span>
        </div>
        <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800/50 group hover:bg-gray-900 transition-colors">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">{currentLabels.recent}</span>
          <span className="text-3xl font-black text-emerald-500">{data.solvedThisYear || data.contributionsLastYear || 0}</span>
        </div>
        <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800/50 group hover:bg-gray-900 transition-colors">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">{currentLabels.max}</span>
          <span className="text-3xl font-black text-blue-500">{data.maxRating || data.publicRepos || '--'}</span>
        </div>
        <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800/50 group hover:bg-gray-900 transition-colors">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">{currentLabels.extra}</span>
          <span className="text-3xl font-black text-purple-500">{data.contestsParticipated || data.totalPRs || 0}</span>
        </div>
      </div>

      {/* Achievements - Special for GitHub */}
      {data.achievements && data.achievements.length > 0 && (
        <div className="mb-10 bg-gray-900/30 p-8 rounded-[2rem] border border-gray-800">
           <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Recent Achievements</h4>
           <div className="flex flex-wrap gap-3">
             {data.achievements.map((achievement, idx) => (
               <div key={idx} className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20 text-xs font-bold transition-all hover:bg-indigo-500/20">
                 ✨ {achievement}
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Graph */}
        <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800">
          <h4 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Contest Rating Graph</h4>
          <div className="h-[250px]">
            {data.ratingGraph && data.ratingGraph.length > 0 ? (
               <Line data={ratingChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                No rating history available for this platform.
              </div>
            )}
          </div>
        </div>

        {/* Problem Solving Graph / Activity Graph */}
        <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800">
          <h4 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">
            {name === 'GitHub' ? 'Open Source Activity' : 'Problem Solving Activity'}
          </h4>
          <div className="h-[250px]">
             {(data.solvedGraph && data.solvedGraph.length > 0) || (data.contributionGraph && data.contributionGraph.length > 0) ? (
               <Bar data={solvedChartData} options={chartOptions} />
             ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                No activity data available.
              </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

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
        } else {
          setError('Failed to fetch dashboard data. Please try again later.');
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
      <div className="min-h-screen bg-[#060e20] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-[#ba9eff]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#53ddfc] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="font-black tracking-[0.4em] uppercase text-[10px] text-[#53ddfc] animate-pulse">Synchronizing Data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] p-4 md:p-12 lg:p-20 font-sans selection:bg-[#ba9eff]/30 scroll-smooth">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Hero Header */}
        <div className="relative mb-24 overflow-visible">
          {/* Liquid background blobs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#ba9eff]/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute top-20 -left-40 w-80 h-80 bg-[#53ddfc]/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-12 bg-[#ba9eff]"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ba9eff]">The Digital Architect</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white leading-none mb-8">
                {user?.name?.split(' ')[0] || 'Developer'}<span className="text-[#53ddfc]">.</span>
              </h1>
              <p className="text-xl text-[#a3aac4] font-medium leading-relaxed max-w-lg">
                Your high-performance analytics deck. Mapping your technical evolution across the global competitive landscape.
              </p>
            </div>
            
            <div className="flex bg-[#0f1930]/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-[#192540] shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.02]">
               <div className="text-center px-6">
                 <span className="block text-5xl font-black text-white mb-2">{data?.totalSolved || 0}</span>
                 <span className="text-[10px] text-[#a3aac4] uppercase font-black tracking-widest whitespace-nowrap">Global Solved</span>
               </div>
               <div className="w-px bg-[#192540] mx-4 h-16 self-center"></div>
               <div className="text-center px-6">
                 <span className="block text-5xl font-black text-[#53ddfc] mb-2">{data?.averageProblemsPerDay || 0}</span>
                 <span className="text-[10px] text-[#a3aac4] uppercase font-black tracking-widest whitespace-nowrap">Daily Velocity</span>
               </div>
            </div>
          </div>
        </div>

        {/* Platform Sections with Liquid Obsidian Theme */}
        <div className="space-y-24">
          <PlatformSection 
            name="LeetCode" 
            data={data?.platforms?.leetcode} 
            color="text-[#f59e0b]" 
            icon={<span className="text-2xl">⚡</span>} 
          />

          <PlatformSection 
            name="GitHub" 
            data={data?.platforms?.github} 
            color="text-[#818cf8]" 
            icon={<span className="text-2xl">🐙</span>} 
            labels={{
              total: 'Core Contributions',
              recent: 'Annual Activity',
              rating: 'Followers',
              max: 'Repositories',
              extra: 'Pull Requests'
            }}
          />
          
          <PlatformSection 
            name="Codeforces" 
            data={data?.platforms?.codeforces} 
            color="text-[#ef4444]" 
            icon={<span className="text-2xl">🏆</span>} 
          />
          
          <PlatformSection 
            name="GeeksforGeeks" 
            data={data?.platforms?.gfg} 
            color="text-[#22c55e]" 
            icon={<span className="text-2xl">🌳</span>} 
          />
        </div>

        {/* Footer info */}
        <div className="mt-32 pt-12 border-t border-[#192540] text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#4d556b]">
             Powered by CodeProfile Aggregator v2.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
