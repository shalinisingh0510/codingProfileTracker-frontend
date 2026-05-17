import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, toggleBookmark, recordReadingHistory } from '../services/api';

const ResourceHub = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedResource, setSelectedResource] = useState(null);
  const [lockedResource, setLockedResource] = useState(null); // Tracks the resource prompting an upsell
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResources, setTotalResources] = useState(0);
  
  const categories = ['All', 'DSA', 'System Design', 'Resume', 'General'];

  useEffect(() => {
    fetchResources();
  }, [activeCategory, currentPage]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getResources(activeCategory, currentPage, 9);
      
      // Defensive handling of response format
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

  // Toggle bookmark handler with instant responsive state mapping
  const handleToggleBookmark = async (id) => {
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

  // Launch module and log in reading history
  const handleLaunchModule = async (resource) => {
    setSelectedResource(resource);
    try {
      await recordReadingHistory(resource._id);
    } catch (error) {
      console.error("Failed to update history:", error);
    }
  };

  return (
    <div className="mt-32 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="h-px w-12 bg-cyan-400"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Knowledge Deck</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
            Resource Hub<span className="text-cyan-400">.</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 bg-[#0f172a]/20 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.length > 0 ? resources.map(resource => (
              <div 
                key={resource._id} 
                className={`group relative bg-[#0f172a]/30 border rounded-[2.5rem] p-8 transition-all hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-5 duration-500 flex flex-col justify-between min-h-[320px] ${
                  resource.isLocked 
                    ? 'border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-950/5' 
                    : 'border-gray-800 hover:bg-[#0f172a]/50 hover:border-cyan-500/30'
                }`}
              >
                {/* Lock Badge */}
                {resource.isLocked && (
                  <div className="absolute top-6 left-6 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1 shadow-lg">
                    <span>🔒 Premium</span>
                  </div>
                )}

                {/* Bookmark Toggle Icon (Interactive, absolute top-right) */}
                {token && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(resource._id);
                    }}
                    className={`absolute p-2.5 rounded-xl border backdrop-blur-3xl transition-all duration-300 z-10 cursor-pointer ${
                      resource.isBookmarked 
                        ? 'bg-cyan-500/10 border-cyan-400/50 text-cyan-400 shadow-md shadow-cyan-500/10' 
                        : 'bg-[#0f172a]/40 border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'
                    }`}
                    style={{ 
                      top: resource.isLocked ? '3.5rem' : '1.5rem',
                      right: '1.5rem'
                    }}
                  >
                    {resource.isBookmarked ? '★' : '☆'}
                  </button>
                )}

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-[#060e20] rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-gray-800">
                      {resource.isLocked ? '🔒' : (resource.category === 'DSA' ? '📚' : resource.category === 'System Design' ? '🗺️' : resource.category === 'Resume' ? '📄' : '💎')}
                    </div>
                    <div className="flex flex-col items-end gap-1 pr-12">
                      {resource.tags?.map(tag => (
                        <span key={tag} className={`text-[8px] font-black uppercase tracking-widest leading-none ${resource.isLocked ? 'text-amber-500/60' : 'text-cyan-500/60'}`}>
                          • {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className={`text-xl font-black mb-3 transition-colors tracking-tight ${resource.isLocked ? 'text-white/60 group-hover:text-amber-400' : 'text-white group-hover:text-cyan-400'}`}>
                    {resource.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-8 flex-grow line-clamp-4">
                    {resource.description}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    if (resource.isLocked) {
                      setLockedResource(resource);
                    } else {
                      handleLaunchModule(resource);
                    }
                  }}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all w-fit cursor-pointer ${
                    resource.isLocked ? 'text-amber-400' : 'text-cyan-400'
                  }`}
                >
                  {resource.isLocked ? 'Unlock Module 🔒' : 'Launch Module <span>→</span>'}
                </button>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 bg-gray-900/10 rounded-[2rem] border border-dashed border-gray-800">
                 <p className="text-gray-600 font-medium italic">No materials found in this category.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 bg-[#0f172a]/40 border border-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ←
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${
                      currentPage === i + 1
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                      : 'bg-[#0f172a]/20 text-gray-500 border border-gray-800 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 bg-[#0f172a]/40 border border-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1121] border border-gray-800 rounded-[3rem] w-full max-w-5xl p-8 md:p-16 relative animate-in zoom-in-95 duration-300 my-10 max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            <button 
              onClick={() => setSelectedResource(null)}
              className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors text-3xl cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-12">
              <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-cyan-500/20 mb-6 inline-block">
                {selectedResource.category}
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                {selectedResource.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                <span>By {selectedResource.author?.name || 'Admin'}</span>
                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                <span>{new Date(selectedResource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div 
              className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-loose text-lg"
              dangerouslySetInnerHTML={{ __html: selectedResource.content }}
            />

            {selectedResource.link && (
              <div className="mt-16 pt-10 border-t border-gray-800">
                <a 
                  href={selectedResource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                   External Material Source ↗
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOCKED RESOURCE UPSELL INTERCEPTOR MODAL */}
      {lockedResource && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0b0f19] border border-gray-800 rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl text-center">
            <button
              onClick={() => setLockedResource(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white font-bold text-xl cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-5xl">🔒</span>
              <h3 className="text-2xl font-black mt-4 text-white">Unlock Premium Hub</h3>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mt-2">
                ⭐ Plus / 👑 Premium Level Required
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800/80 rounded-2xl p-5 mb-6 text-left space-y-3.5">
              <p className="text-xs text-gray-300 leading-relaxed">
                The educational module <strong>"{lockedResource.title}"</strong> is exclusively available to our subscribed members.
              </p>
              <div className="border-t border-gray-800/80 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                  <span className="text-emerald-400">✓</span> Unlimited Advanced DSA Sheets
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                  <span className="text-emerald-400">✓</span> System Design Mastery Playbooks
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                  <span className="text-emerald-400">✓</span> AI-Powered Profile Analysis Reports
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setLockedResource(null);
                navigate('/pricing');
              }}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#020617] font-black rounded-2xl text-xs uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Unlock Now & Get Plus / Premium 🚀
            </button>

            <button
              onClick={() => setLockedResource(null)}
              className="w-full py-3 bg-gray-900/50 hover:bg-gray-900 border border-gray-800/80 text-gray-400 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all mt-3 cursor-pointer"
            >
              Back to Free Sheets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceHub;
