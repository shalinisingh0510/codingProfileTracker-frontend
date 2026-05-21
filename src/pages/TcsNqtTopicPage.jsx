import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getStoredUsername, getDashboardPath } from '../utils/routes';
import { TCS_NQT_GUIDE } from '../data/examGuides';

const TcsNqtTopicPage = () => {
  const { sectionSlug, topicSlug } = useParams();
  const navigate = useNavigate();
  const username = getStoredUsername();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topicDetail, setTopicDetail] = useState(null);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'https://codingprofiletracker-backend.onrender.com/api'}/exam-guides/tcs-nqt/sections/${sectionSlug}/topics/${topicSlug}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch topic');
        }

        const data = await response.json();
        if (!data?.topic?.contentMarkdown) {
          throw new Error('Missing topic content');
        }

        setTopicDetail(data.topic);
      } catch (err) {
        setError('This topic content is not available yet. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [sectionSlug, topicSlug]);

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-[-12%] left-[-8%] w-[45%] h-[45%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-8%] w-[45%] h-[45%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        <div className="flex flex-col gap-4">
          <Link
            to="/exam-guide/tcs-nqt"
            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex w-fit cursor-pointer"
          >
            ← Back to TCS NQT Guide
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
              {sectionSlug.replace('-', ' ')} Topic
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            {topicDetail?.title || topicSlug.replace('-', ' ')}
            <span className="text-emerald-400">.</span>
          </h1>
        </div>

        <div className="bg-[#0b1121] border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-red-400 mb-4 text-xl">⚠️</div>
              <div className="text-red-300 text-sm max-w-md">{error}</div>
              <button 
                onClick={() => navigate('/exam-guide/tcs-nqt')}
                className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                Go back
              </button>
            </div>
          ) : (
            <div className="prose prose-invert prose-emerald lg:prose-lg max-w-none text-gray-300">
              <Markdown remarkPlugins={[remarkGfm]}>{topicDetail?.contentMarkdown || ''}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TcsNqtTopicPage;
