import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBookmarks, getReadingHistory, toggleBookmark } from '../services/api';
import { getDashboardPath, getStoredUsername } from '../utils/routes';

const TABS = ['bookmarks', 'history'];

const LibraryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'bookmarks';

  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const username = getStoredUsername();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      setError('');

      try {
        const [bookmarkData, historyData] = await Promise.all([
          getBookmarks(),
          getReadingHistory(),
        ]);

        setBookmarks(Array.isArray(bookmarkData) ? bookmarkData : []);
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error('Failed to load library:', err);
        setError('Failed to load your saved resources. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const activeResources = useMemo(
    () => (activeTab === 'bookmarks' ? bookmarks : history),
    [activeTab, bookmarks, history],
  );

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleResourceClick = (resource) => {
    if (resource.isLocked) {
      navigate('/pricing');
      return;
    }

    const identifier = resource.slug || resource._id;
    navigate(`/resources/${identifier}`);
  };

  const handleToggleBookmark = async (event, resourceId) => {
    event.stopPropagation();
    event.preventDefault();

    try {
      const result = await toggleBookmark(resourceId);

      setBookmarks((prev) => {
        if (!result.bookmarked) {
          return prev.filter((resource) => resource._id !== resourceId);
        }

        return prev.map((resource) =>
          resource._id === resourceId
            ? { ...resource, isBookmarked: true }
            : resource,
        );
      });

      setHistory((prev) =>
        prev.map((resource) =>
          resource._id === resourceId
            ? { ...resource, isBookmarked: result.bookmarked }
            : resource,
        ),
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/8 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/8 blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <button
              onClick={() => navigate(getDashboardPath(username))}
              className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider mb-5 inline-block cursor-pointer"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-12 bg-cyan-400"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Personal Library</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
              Bookmarks & History<span className="text-cyan-400">.</span>
            </h1>
            <p className="text-gray-500 text-sm mt-3 max-w-2xl leading-relaxed">
              Open saved blogs and your recently visited articles in a full page view, without pushing content into the navbar.
            </p>
          </div>

          <div className="flex gap-1.5 p-1.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl w-fit">
            <button
              onClick={() => handleTabChange('bookmarks')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Bookmarks ({bookmarks.length})
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              History ({history.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-slate-900/20 border border-red-500/20 rounded-3xl px-8 py-14 text-center">
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        ) : activeResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeResources.map((resource) => (
              <article
                key={resource._id}
                onClick={() => handleResourceClick(resource)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleResourceClick(resource);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`group relative text-left bg-slate-900/20 border rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[280px] cursor-pointer ${
                  resource.isLocked
                    ? 'border-amber-500/10 hover:border-amber-500/25'
                    : 'border-gray-800 hover:border-cyan-500/30 hover:bg-slate-900/30'
                }`}
              >
                <button
                  onClick={(event) => handleToggleBookmark(event, resource._id)}
                  className={`absolute top-5 right-5 w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition-all z-10 cursor-pointer ${
                    resource.isBookmarked
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-950/60 border-gray-800 text-gray-600 hover:text-white hover:border-gray-700'
                  }`}
                >
                  {resource.isBookmarked ? '★' : '☆'}
                </button>

                <div>
                  <div className="flex items-center gap-2 mb-5 pr-10">
                    <span className="px-3 py-1 bg-slate-950 border border-gray-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-cyan-500/70">
                      {resource.category}
                    </span>
                    {resource.isLocked && (
                      <span className="text-[8px] font-bold uppercase tracking-widest text-amber-400/80">
                        Locked
                      </span>
                    )}
                  </div>

                  <h2 className={`text-lg font-black mb-3 tracking-tight leading-snug transition-colors ${
                    resource.isLocked ? 'text-white/60 group-hover:text-amber-400' : 'text-white group-hover:text-cyan-400'
                  }`}>
                    {resource.title}
                  </h2>

                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-4">
                    {resource.description}
                  </p>

                  {resource.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {resource.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                    resource.isLocked ? 'text-amber-400/80' : 'text-cyan-400/80'
                  }`}>
                    {resource.isLocked ? 'Unlock to read' : 'Open article →'}
                  </span>
                  {resource.author?.name && (
                    <span className="text-[10px] text-gray-600 font-medium truncate">
                      {resource.author.name}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/10 rounded-3xl border border-dashed border-gray-800 px-8 py-20 text-center">
            <p className="text-white text-lg font-bold mb-3">
              {activeTab === 'bookmarks' ? 'No bookmarks yet.' : 'No reading history yet.'}
            </p>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              {activeTab === 'bookmarks'
                ? 'Save helpful blogs from the Resource Hub and they will appear here.'
                : 'Open a resource blog and we will keep your recent reading trail here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
