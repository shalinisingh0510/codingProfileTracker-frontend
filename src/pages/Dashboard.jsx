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

const PlatformSection = ({ name, data, color, icon }) => {
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

  // Rating Graph Data
  const ratingChartData = {
    labels: data.ratingGraph?.map(g => g.date) || [],
    datasets: [
      {
        label: `${name} Rating`,
        data: data.ratingGraph?.map(g => g.rating) || [],
        borderColor: color.replace('text-', '').replace('500', '400'),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 2,
      },
    ],
  };

  // Solving Graph Data
  const solvedChartData = {
    labels: data.solvedGraph?.map(g => g.date) || [],
    datasets: [
      {
        label: 'Daily Solved',
        data: data.solvedGraph?.map(g => g.count) || [],
        backgroundColor: color.replace('text-', '').includes('yellow') ? 'rgba(245, 158, 11, 0.6)' : 
                        color.replace('text-', '').includes('green') ? 'rgba(34, 197, 94, 0.6)' : 
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
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#64748b', font: { size: 10 } } }
    }
  };

  return (
    <div className="bg-gray-800/40 p-6 md:p-8 rounded-[2rem] border border-gray-800 mb-12 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className={`text-3xl font-black tracking-tighter flex items-center gap-3 ${color}`}>
          <span className="p-3 bg-gray-900 rounded-2xl shadow-inner">{icon}</span>
          {name} Profile
        </h2>
        <div className="flex gap-2">
           <span className="px-4 py-1.5 bg-gray-900 rounded-full text-xs font-bold text-gray-400 border border-gray-700">
             {data.rank || data.ranking || 'N/A'}
           </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Total Solved</span>
          <span className="text-2xl font-black text-white">{data.totalSolved || data.problemsSolved || 0}</span>
        </div>
        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Solved (2024)</span>
          <span className="text-2xl font-black text-emerald-500">{data.solvedThisYear || 0}</span>
        </div>
        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Max Rating</span>
          <span className="text-2xl font-black text-blue-500">{data.maxRating || '--'}</span>
        </div>
        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Contests</span>
          <span className="text-2xl font-black text-purple-500">{data.contestsParticipated || 0}</span>
        </div>
      </div>

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

        {/* Problem Solving Graph */}
        <div className="bg-gray-900/30 p-6 rounded-3xl border border-gray-800">
          <h4 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Problem Solving Activity</h4>
          <div className="h-[250px]">
             {data.solvedGraph && data.solvedGraph.length > 0 ? (
               <Bar data={solvedChartData} options={chartOptions} />
             ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                No solving activity data available.
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-bold tracking-widest uppercase text-xs text-blue-400">Syncing Data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        {/* New Hero Header */}
        <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-800 overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-500/20">
                Performance Overview
              </span>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-white">
                {user?.name || 'Developer'}<span className="text-blue-500">.</span>
              </h1>
              <p className="max-w-md text-gray-400 font-medium leading-relaxed">
                Your unified coding profile dashboard. Track your growth, ratings, and consistency across platforms.
              </p>
            </div>
            
            <div className="flex gap-4 md:gap-8 bg-gray-900/50 p-8 rounded-3xl border border-gray-800 shadow-inner">
               <div className="text-center">
                 <span className="block text-4xl font-black text-white">{data?.totalSolved || 0}</span>
                 <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Solved</span>
               </div>
               <div className="w-px bg-gray-800 h-12 "></div>
               <div className="text-center">
                 <span className="block text-4xl font-black text-blue-400">{data?.averageProblemsPerDay || 0}</span>
                 <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Avg Daily</span>
               </div>
            </div>
          </div>
        </div>

        {/* Platform Sections */}
        <PlatformSection 
          name="LeetCode" 
          data={data?.platforms?.leetcode} 
          color="text-yellow-500" 
          icon="LC" 
        />
        
        <PlatformSection 
          name="Codeforces" 
          data={data?.platforms?.codeforces} 
          color="text-red-500" 
          icon="CF" 
        />
        
        <PlatformSection 
          name="GeeksforGeeks" 
          data={data?.platforms?.gfg} 
          color="text-green-500" 
          icon="GG" 
        />
      </div>
    </div>
  );
};

export default Dashboard;
