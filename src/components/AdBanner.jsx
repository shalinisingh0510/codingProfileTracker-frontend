import React from 'react';

const AdBanner = () => {
  return (
    <div className="relative group overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2rem] border border-cyan-500/20 shadow-2xl transition-all duration-500 hover:shadow-cyan-500/10 hover:border-cyan-500/40 p-1 animate-float">
      {/* Animated Gradient Beam */}
      <div className="absolute -inset-[100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#22d3ee_0%,transparent_20%,transparent_80%,#818cf8_100%)] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
      
      <div className="relative bg-[#0b1121] rounded-[1.9rem] p-8 h-full">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-cyan-500/20 backdrop-blur-md">
              Featured Insight
            </span>
            <div className="w-10 h-10 bg-gray-900/50 backdrop-blur-xl rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5">
              ⚡
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
              Master System Design <span className="text-cyan-400">Like a Pro.</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Unlock the core architectural patterns used by big tech companies. From scalability to extreme performance.
            </p>
          </div>
          
          <div className="pt-4 mt-auto">
            <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-95">
              Explore Blueprints
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative blobs */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
    </div>
  );
};

export default AdBanner;
