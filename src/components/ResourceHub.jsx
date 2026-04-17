import React, { useState } from 'react';

const resources = [
  {
    id: 1,
    title: "Striver's A2Z DSA Sheet",
    category: "DSA",
    description: "The ultimate roadmap to master Data Structures and Algorithms from scratch.",
    icon: "📚",
    tags: ["Best Seller", "Placement"]
  },
  {
    id: 2,
    title: "System Design Blueprints",
    category: "System Design",
    description: "visual guide to HLD and LLD patterns used in scalable microservices.",
    icon: "🗺️",
    tags: ["High Level", "Scalability"]
  },
  {
    id: 3,
    title: "Elite Resume Templates",
    category: "Resume",
    description: "ATS-friendly templates designed to get you noticed by top-tier tech recruiters.",
    icon: "📄",
    tags: ["Career", "Templates"]
  },
  {
    id: 4,
    title: "Low Level Design (LLD)",
    category: "System Design",
    description: "Master SOLID principles and Design Patterns with real-world coding examples.",
    icon: "🛠️",
    tags: ["Coding", "OOP"]
  },
  {
    id: 5,
    title: "Dynamic Programming Patterns",
    category: "DSA",
    description: "Learn to identify and solve DP problems using 7 distinct mental models.",
    icon: "💎",
    tags: ["Logic", "Patterns"]
  },
  {
    id: 6,
    title: "Power Words for Bullet Points",
    category: "Resume",
    description: "A comprehensive list of action verbs to make your achievements stand out.",
    icon: "🔥",
    tags: ["Writing", "Impact"]
  }
];

const ResourceHub = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'DSA', 'System Design', 'Resume', 'General'];

  const filteredResources = activeCategory === 'All' 
    ? resources 
    : resources.filter(r => r.category === activeCategory);

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

        <div className="flex flex-wrap gap-2 p-1.5 bg-[#0f172a]/40 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-x-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div 
            key={resource.id} 
            className="group relative bg-[#0f172a]/30 border border-gray-800 rounded-[2rem] p-8 transition-all hover:bg-[#0f172a]/50 hover:border-cyan-500/30 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-5 duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-[#060e20] rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-gray-800">
                {resource.icon}
              </div>
              <div className="flex flex-col items-end gap-1">
                {resource.tags.map(tag => (
                  <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-cyan-500/60 leading-none">
                    • {tag}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-xl font-black text-white mb-3 group-hover:text-cyan-400 transition-colors tracking-tight">
              {resource.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
              {resource.description}
            </p>

            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 group-hover:gap-4 transition-all">
              Launch Module <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceHub;
