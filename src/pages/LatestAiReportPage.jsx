import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { getLastAiReport } from '../services/api';
import { getDashboardPath, getStoredUsername } from '../utils/routes';

const LatestAiReportPage = () => {
  const navigate = useNavigate();
  const username = getStoredUsername();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emptyState, setEmptyState] = useState(false);
  const [legacyReport, setLegacyReport] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchLastReport = async () => {
      try {
        const data = await getLastAiReport();

        if (data?.id) {
          navigate(`/ai-report/${data.id}`, { replace: true });
          return;
        }

        if (data?.report) {
          setLegacyReport(data.report);
          return;
        }

        setEmptyState(true);
      } catch (err) {
        console.error('Failed to fetch latest AI report:', err);
        setError('Failed to load your latest AI report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLastReport();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/8 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/8 blur-[140px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <button
          onClick={() => navigate(getDashboardPath(username))}
          className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 inline-block cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-[#0b1121] border border-gray-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm font-medium">Opening your latest AI report...</p>
            </div>
          ) : error ? (
            <>
              <span className="px-3 py-1 bg-red-500/10 text-red-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20 mb-5 inline-block">
                Report Error
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white mb-4">We could not open the report.</h1>
              <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
            </>
          ) : legacyReport ? (
            <div className="text-left">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-500/20 mb-5 inline-block">
                Legacy Report
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white mb-8 text-center">Your latest AI report.</h1>
              <div className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-relaxed text-base">
                <Markdown>{legacyReport}</Markdown>
              </div>
            </div>
          ) : emptyState ? (
            <>
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-500/20 mb-5 inline-block">
                AI Assessment
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white mb-4">No AI report yet.</h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
                Your latest report will open here once you run profile analysis from the dashboard.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LatestAiReportPage;
