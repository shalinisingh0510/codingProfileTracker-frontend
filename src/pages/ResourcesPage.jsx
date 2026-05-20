import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getResources, toggleBookmark } from '../services/api';

const ResourcesPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const activeSearch = searchParams.get('q') || '';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockedResource, setLockedResource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResources, setTotalResources] = useState(0);
  const [searchInput, setSearchInput] = useState(activeSearch);

  const categories = ['All', 'DSA', 'System Design', 'Backend', 'Frontend', 'Full stack', 'Cloud', 'Ci/cd', 'Misc'];

  useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const data = await getResources(activeCategory, currentPage, 9, activeSearch);
        if (Array.isArray(data)) {
          setResources(data);
          setTotalPages(1);
          setTotalResources(data.length);
        } else {
          setResources(data.resources || []);
          setTotalPages(data.pages || 1);
          setTotalResources(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [activeCategory, activeSearch, currentPage]);

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('category', cat);
    if (!activeSearch) {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedSearch = searchInput.trim();
    const nextParams = new URLSearchParams(searchParams);

    if (trimmedSearch) {
      nextParams.set('q', trimmedSearch);
    } else {
      nextParams.delete('q');
    }

    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleToggleBookmark = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await toggleBookmark(id);
      setResources(prev => prev.map(resource => {
        if (resource._id === id) {
          return { ...resource, isBookmarked: res.bookmarked };
        }
        return resource;
      }));
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const handleCardClick = (resource) => {
    if (resource.isLocked) {
      setLockedResource(resource);
    } else {
      // Navigate to full page using slug (or fallback to _id)
      const identifier = resource.slug || resource._id;
      navigate(`/resources/${identifier}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/8 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/8 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-12 bg-cyan-400"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Knowledge Base</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              Resource Hub<span className="text-cyan-400">.</span>
            </h1>
            <p className="text-gray-500 text-sm mt-3 max-w-xl leading-relaxed">
              Curated master sheets, full-stack playbooks, system design patterns, and study guides prepared by engineering coaches.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-5 text-[10px] font-black uppercase tracking-[0.25em]">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                Free content first
              </span>
              <span className="text-gray-600">
                {totalResources} {totalResources === 1 ? 'blog' : 'blogs'} found
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center bg-slate-900/30 border border-white/5 rounded-3xl p-4 md:p-5"
        >
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search blogs by title, topic, tag, or category..."
              className="w-full px-5 py-4 rounded-2xl bg-[#0b1121] border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-start lg:justify-end">
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-cyan-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              Search
            </button>
            {activeSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-5 py-3 rounded-2xl bg-slate-900/70 border border-gray-800 text-gray-300 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.length > 0 ? resources.map(resource => (
                <div
                  key={resource._id}
                  onClick={() => handleCardClick(resource)}
                  className={`group relative bg-slate-900/20 border rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[300px] cursor-pointer ${
                    resource.isLocked
                      ? 'border-amber-500/10 hover:border-amber-500/25'
                      : 'border-gray-800 hover:border-cyan-500/30 hover:bg-slate-900/30'
                  }`}
                >
                  {/* Lock Badge */}
                  {resource.isLocked && (
                    <div className="absolute top-5 left-5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-amber-400 shadow-lg">
                      Premium
                    </div>
                  )}

                  {/* Bookmark */}
                  {token && (
                    <button
                      onClick={(e) => handleToggleBookmark(e, resource._id)}
                      className={`absolute top-5 right-5 w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition-all z-10 cursor-pointer ${
                        resource.isBookmarked
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                          : 'bg-slate-950/60 border-gray-800 text-gray-600 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      {resource.isBookmarked ? '★' : '☆'}
                    </button>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="px-3 py-1 bg-slate-950 border border-gray-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-cyan-500/70">
                        {resource.category}
                      </span>
                      {resource.isFree && (
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                          Free
                        </span>
                      )}
                      {resource.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[8px] font-bold uppercase tracking-widest text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className={`text-lg font-black mb-2 tracking-tight leading-snug transition-colors ${
                      resource.isLocked ? 'text-white/50 group-hover:text-amber-400' : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {resource.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {resource.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                      resource.isLocked ? 'text-amber-400/80' : 'text-cyan-400/80'
                    }`}>
                      {resource.isLocked ? 'Unlock to read' : 'Read article →'}
                    </span>
                    {resource.author?.name && (
                      <span className="text-[9px] text-gray-600 font-medium">
                        {resource.author.name}
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-24 bg-slate-900/10 rounded-3xl border border-dashed border-gray-800">
                  <p className="text-gray-300 text-sm font-semibold">
                    No blogs matched your search.
                  </p>
                  <p className="text-gray-500 text-sm italic mt-2">
                    Try a different keyword, tag, or category.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-16">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 bg-slate-900/40 border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-sm"
                >
                  ←
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === i + 1
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-900/20 text-gray-500 border border-gray-800 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 bg-slate-900/40 border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-sm"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Locked Resource Upsell Modal */}
      {lockedResource && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b0f19] border border-gray-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl text-center">
            <button
              onClick={() => setLockedResource(null)}
              className="absolute top-5 right-5 text-gray-500 hover:text-white text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4">
                🔒
              </div>
              <h3 className="text-xl font-black text-white">Premium Content</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                <strong>"{lockedResource.title}"</strong> requires a Plus or Premium subscription.
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <span className="text-emerald-400">✓</span> All advanced DSA sheets
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <span className="text-emerald-400">✓</span> System design playbooks
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <span className="text-emerald-400">✓</span> AI profile analysis
              </div>
            </div>

            <button
              onClick={() => { setLockedResource(null); navigate('/pricing'); }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#020617] font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer hover:from-cyan-400 hover:to-emerald-400 transition-all"
            >
              View Plans
            </button>
            <button
              onClick={() => setLockedResource(null)}
              className="w-full py-3 bg-slate-900 border border-gray-800 text-gray-400 hover:text-white font-semibold rounded-2xl text-xs uppercase tracking-wider mt-2 cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
