import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { getAiReportById, getAiRecommendations, toggleBookmark } from '../services/api';

const AiReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchReport = async () => {
      try {
        const data = await getAiReportById(id);
        setReport(data.report);
      } catch (err) {
        console.error(err);
        setError("Failed to load AI Report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleImprove = async () => {
    if (showRecommendations) return;
    setLoadingRecommendations(true);
    setShowRecommendations(true);
    try {
      const data = await getAiRecommendations(id);
      setRecommendations(data.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleToggleBookmark = async (e, resourceId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await toggleBookmark(resourceId);
      setRecommendations(prev => prev.map(resource => {
        if (resource._id === resourceId) {
          return { ...resource, isBookmarked: res.bookmarked };
        }
        return resource;
      }));
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const handleCardClick = (resource) => {
    if (resource.isLocked) {
      navigate('/pricing');
    } else {
      const identifier = resource.slug || resource._id;
      navigate(`/resources/${identifier}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Analyzing Profile Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl font-bold mb-4">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-xl text-gray-400 hover:text-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-cyan-900/10 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-10 border-b border-slate-800/60 pb-5">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 inline-block"
          >
            ← Back to Dashboard
          </button>
          <br/>
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-500/20 mb-4 inline-block">
            AI Assessment
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Profile Analysis Report
          </h1>
        </div>

        <div className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-relaxed text-base bg-[#0b1121] p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl">
          <Markdown>{report}</Markdown>
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={handleImprove}
            disabled={loadingRecommendations}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl text-white font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loadingRecommendations ? 'Generating Plan...' : 'Improve'}
          </button>
        </div>

        {showRecommendations && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-3">Recommended Learning Path</h2>
              <p className="text-gray-500 text-sm">Curated resources based on your identified weaknesses.</p>
            </div>

            {loadingRecommendations ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.length > 0 ? recommendations.map(resource => (
                  <div
                    key={resource._id}
                    onClick={() => handleCardClick(resource)}
                    className="group relative bg-[#0b1121] border border-gray-800 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-slate-900/30 cursor-pointer flex flex-col justify-between min-h-[250px]"
                  >
                    <button
                      onClick={(e) => handleToggleBookmark(e, resource._id)}
                      className={`absolute top-5 right-5 w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition-all z-10 ${
                        resource.isBookmarked
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                          : 'bg-slate-950/60 border-gray-800 text-gray-600 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      {resource.isBookmarked ? '★' : '☆'}
                    </button>

                    <div className="mt-2">
                      <span className="px-3 py-1 bg-slate-950 border border-gray-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-cyan-500/70 mb-4 inline-block">
                        {resource.category}
                      </span>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-400 mb-2 tracking-tight leading-snug transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                        {resource.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400/80">
                        Read article →
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No matching resources found for these topics. Check out the Resource Hub for all materials.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiReportPage;
