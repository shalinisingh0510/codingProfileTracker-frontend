import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getResourceBySlug, toggleBookmark, recordReadingHistory } from '../services/api';

const ResourceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const articleRef = useRef(null);

  // Move practice links to bottom after render
  useEffect(() => {
    if (articleRef.current) {
      const sections = articleRef.current.querySelectorAll('.rh-sync-section');
      sections.forEach(section => {
        const kicker = section.querySelector('.rh-sync-kicker');
        if (kicker && kicker.textContent.trim().toLowerCase().includes('practice link')) {
          // Append to end of article
          articleRef.current.appendChild(section);
        }
      });
    }
  }, [resource]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchResource = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getResourceBySlug(slug);
        setResource(data);
        setIsBookmarked(data.isBookmarked || false);

        // Record reading history silently
        if (token && data._id) {
          recordReadingHistory(data._id).catch(() => {});
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('locked');
        } else if (err.response?.status === 404) {
          setError('not_found');
        } else {
          setError('generic');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [slug, token]);

  const handleToggleBookmark = async () => {
    if (!resource?._id) return;
    try {
      const res = await toggleBookmark(resource._id);
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading module...</p>
        </div>
      </div>
    );
  }

  // Locked state
  if (error === 'locked') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center text-4xl">
            🔒
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Premium Module</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            This content is exclusively available to Plus and Premium subscribers. Upgrade your plan to unlock all advanced learning materials.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#020617] font-black rounded-2xl text-sm uppercase tracking-wider cursor-pointer hover:from-cyan-400 hover:to-emerald-400 transition-all"
            >
              View Plans
            </button>
            <button
              onClick={() => navigate('/resources')}
              className="w-full py-3 bg-slate-900 border border-slate-800 text-gray-400 hover:text-white font-semibold rounded-2xl text-sm cursor-pointer transition-colors"
            >
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found / generic error
  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-black text-white tracking-tight">Module Not Found</h1>
          <p className="text-gray-400 text-sm">The resource you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/resources')}
            className="px-8 py-3 bg-slate-900 border border-slate-800 text-gray-300 hover:text-white font-semibold rounded-2xl text-sm cursor-pointer transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-cyan-900/8 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-28 pb-24 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-10">
          <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
          <span>/</span>
          <Link to={`/resources?category=${encodeURIComponent(resource.category)}`} className="hover:text-white transition-colors">{resource.category}</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px]">{resource.title}</span>
        </div>

        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-cyan-500/20">
              {resource.category}
            </span>
            {resource.tags?.map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-900 text-gray-500 text-[9px] font-bold uppercase tracking-widest rounded-full border border-slate-800">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
            {resource.title}<span className="text-cyan-400">.</span>
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
              <span>By {resource.author?.name || 'Admin'}</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span>{new Date(resource.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {token && (
              <button
                onClick={handleToggleBookmark}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
            )}
          </div>
        </header>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-16"></div>

        {/* Content */}
        <article
          ref={articleRef}
          className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-[1.9] text-[17px] prose-headings:tracking-tight prose-headings:font-black prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm"
          dangerouslySetInnerHTML={{ __html: resource.content }}
        />

        {/* External link */}
        {resource.link && (resource.title.toLowerCase().includes('striver') || resource.title.toLowerCase().includes('fraz') || resource.title.toLowerCase().includes('babbar')) && (
          <div className="mt-20 pt-10 border-t border-gray-800/60">
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all hover:-translate-y-0.5 shadow-lg shadow-cyan-500/10"
            >
              Open External Source ↗
            </a>
          </div>
        )}

        {/* Back to resources */}
        <div className="mt-16 pt-10 border-t border-gray-800/40">
          <button
            onClick={() => navigate('/resources')}
            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            ← Back to all resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
