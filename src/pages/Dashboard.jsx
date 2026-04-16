import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
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

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
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

  // Chart Data Preparation
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Problems Solved',
        data: [2, 5, 3, 7, 5, 8, 4], // Placeholder historical data
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      },
    ],
  };

  const platformsData = {
    labels: ['LeetCode', 'Codeforces', 'GeeksforGeeks'],
    datasets: [
      {
        label: 'Resolved Problems',
        data: [
          data?.platforms?.leetcode?.totalSolved || 0,
          0, // Codeforces solved logic not implemented in API yet
          data?.platforms?.gfg?.problemsSolved || 0,
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderRadius: 10,
      },
    ],
  };

  const difficultyData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          data?.platforms?.leetcode?.easySolved || 0,
          data?.platforms?.leetcode?.mediumSolved || 0,
          data?.platforms?.leetcode?.hardSolved || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          '#22c55e',
          '#f59e0b',
          '#ef4444',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 10 } }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(51, 65, 85, 0.4)' }, ticks: { color: '#64748b' } }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
          Analyzing Profiles...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-2xl max-w-md text-center">
          <p className="mb-4 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-600/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-800">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent italic">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-sm font-medium">Monitoring {user?.name}'s coding activity across platforms.</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-6">
            <div className="text-center">
              <span className="block text-3xl font-black text-blue-500">{data?.totalSolved || 0}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em]">Total Solved</span>
            </div>
            <div className="w-px bg-gray-700 mx-2" />
            <div className="text-center">
              <span className="block text-3xl font-black text-emerald-500">{data?.averageProblemsPerDay || 0}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em]">Avg/Day</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800/40 p-6 rounded-3xl border border-gray-800 min-h-[350px]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Daily Activity (Last 7 Days)
            </h3>
            <div className="h-[250px]">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-800 min-h-[350px]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full" />
              Difficulty Distribution
            </h3>
            <div className="h-[250px]">
              <Pie 
                data={difficultyData} 
                options={{
                  ...chartOptions, 
                  scales: undefined,
                  plugins: { ...chartOptions.plugins, legend: { position: 'right', labels: { color: '#94a3b8' } } }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-800 lg:col-span-1 min-h-[300px]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Platform Comparison
            </h3>
            <div className="h-[200px]">
              <Bar data={platformsData} options={chartOptions} />
            </div>
          </div>

          {/* Platform Detail Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LeetCode Detail */}
            <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700/50 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-yellow-500 font-black text-xl">LC</span>
                <span className="text-xs text-gray-500 font-mono translate-y-1">{user?.leetcodeUsername}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Solved</span>
                  <span className="font-bold">{data?.platforms?.leetcode?.totalSolved || 0}</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '60%' }} />
                </div>
                <div className="flex justify-between text-[10px] pt-1">
                  <span className="text-emerald-500">Easy {data?.platforms?.leetcode?.easySolved || 0}</span>
                  <span className="text-yellow-500">Med {data?.platforms?.leetcode?.mediumSolved || 0}</span>
                  <span className="text-red-500">Hard {data?.platforms?.leetcode?.hardSolved || 0}</span>
                </div>
              </div>
            </div>

            {/* Codeforces Detail */}
            <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700/50 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-red-500 font-black text-xl">CF</span>
                <span className="text-xs text-gray-500 font-mono translate-y-1">{user?.codeforcesHandle}</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Rating</span>
                  <span className="text-xl font-bold">{data?.platforms?.codeforces?.rating || '---'}</span>
                </div>
                <div className="bg-gray-700/30 p-2 rounded-lg text-center">
                  <span className="text-[10px] block text-gray-500 uppercase font-bold">Current Rank</span>
                  <span className="text-xs font-bold text-red-400 capitalize">{data?.platforms?.codeforces?.rank || 'Newbie'}</span>
                </div>
              </div>
            </div>

            {/* GFG Detail */}
            <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700/50 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-green-500 font-black text-xl">GG</span>
                <span className="text-xs text-gray-500 font-mono translate-y-1">{user?.gfgUsername}</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Solved</span>
                  <span className="text-sm font-bold">{data?.platforms?.gfg?.problemsSolved || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Global Rank</span>
                    <span className="font-bold">#{data?.platforms?.gfg?.globalRank || '--'}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">College Rank</span>
                    <span className="font-bold">#{data?.platforms?.gfg?.collegeRank || '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
