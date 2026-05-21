import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#020617] border-t border-slate-800/60 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-gray-400">
        <span>Designed and Developed with</span>
        <span className="text-red-500 animate-pulse">❤️</span>
        <span>by Shalini Singh</span>
        <span className="hidden md:inline mx-2 text-slate-700">|</span>
        <a 
          href="https://shalinikumari.in" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium mt-2 md:mt-0"
        >
          <span>About Me</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
