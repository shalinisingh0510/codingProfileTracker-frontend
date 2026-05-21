import React, { useState } from 'react';

const MultiLangTabs = ({ blocks }) => {
  const [activeLang, setActiveLang] = useState(blocks[0]?.lang || '');

  if (!blocks || blocks.length === 0) return null;

  const activeBlock = blocks.find(b => b.lang === activeLang);

  const langNames = {
    cpp: 'C++',
    java: 'Java',
    python: 'Python',
    javascript: 'JavaScript'
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-[#070b15] shadow-2xl">
      <div className="flex border-b border-slate-800 bg-[#0a101d] overflow-x-auto">
        {blocks.map((block) => (
          <button
            key={block.lang}
            onClick={() => setActiveLang(block.lang)}
            className={`px-5 py-3 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeLang === block.lang
                ? 'text-emerald-400 border-emerald-400 bg-emerald-400/5'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-slate-800/50'
            }`}
          >
            {langNames[block.lang] || block.lang}
          </button>
        ))}
      </div>
      <div className="relative group">
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => navigator.clipboard.writeText(activeBlock?.code || '')}
            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg cursor-pointer transition-all"
          >
            Copy
          </button>
        </div>
        <pre className="p-6 text-emerald-300 font-mono text-xs md:text-sm overflow-x-auto leading-relaxed">
          <code>{activeBlock?.code}</code>
        </pre>
      </div>
    </div>
  );
};

export default MultiLangTabs;
