import React, { useState, useEffect } from 'react';
import { getResources } from '../services/api';

const ResourceHub = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedResource, setSelectedResource] = useState(null);
  
  const categories = ['All', 'DSA', 'System Design', 'Resume', 'General'];

  useEffect(() => {
    fetchResources();
  }, [activeCategory]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getResources(activeCategory);
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
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
              onClick={() => setActiveCategory(cat)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length > 0 ? resources.map(resource => (
            <div 
              key={resource._id} 
              className="group relative bg-[#0f172a]/30 border border-gray-800 rounded-[2rem] p-8 transition-all hover:bg-[#0f172a]/50 hover:border-cyan-500/30 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-5 duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-[#060e20] rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-gray-800">
                  {resource.category === 'DSA' ? '📚' : resource.category === 'System Design' ? '🗺️' : resource.category === 'Resume' ? '📄' : '💎'}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {resource.tags?.map(tag => (
                    <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-cyan-500/60 leading-none">
                      • {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="text-xl font-black text-white mb-3 group-hover:text-cyan-400 transition-colors tracking-tight">
                {resource.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                {resource.description}
              </p>

              <button 
                onClick={() => setSelectedResource(resource)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 group-hover:gap-4 transition-all"
              >
                Launch Module <span>→</span>
              </button>
            </div>
          )) : (
            <div className="col-span-full text-center py-20 bg-gray-900/10 rounded-[2rem] border border-dashed border-gray-800">
               <p className="text-gray-600 font-medium italic">No materials found in this category.</p>
            </div>
          )}
        </div>
      )}

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1121] border border-gray-800 rounded-[3rem] w-full max-w-5xl p-8 md:p-16 relative animate-in zoom-in-95 duration-300 my-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setSelectedResource(null)}
              className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors text-3xl"
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
    </div>
  );
};

export default ResourceHub;
