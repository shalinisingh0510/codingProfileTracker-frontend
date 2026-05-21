import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TCS_NQT_GUIDE } from '../data/examGuides';
import { getDashboardPath, getStoredUsername } from '../utils/routes';

const accentStyles = {
  cyan: {
    badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    border: 'hover:border-cyan-500/30',
    glow: 'from-cyan-500/10 to-transparent',
    text: 'text-cyan-300',
  },
  indigo: {
    badge: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
    border: 'hover:border-indigo-500/30',
    glow: 'from-indigo-500/10 to-transparent',
    text: 'text-indigo-300',
  },
  emerald: {
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    border: 'hover:border-emerald-500/30',
    glow: 'from-emerald-500/10 to-transparent',
    text: 'text-emerald-300',
  },
  amber: {
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    border: 'hover:border-amber-500/30',
    glow: 'from-amber-500/10 to-transparent',
    text: 'text-amber-300',
  },
  rose: {
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    border: 'hover:border-rose-500/30',
    glow: 'from-rose-500/10 to-transparent',
    text: 'text-rose-300',
  },
};

const GuideCardLink = ({ card }) => {
  const style = accentStyles[card.accent] || accentStyles.cyan;

  const sharedClassName = `group relative bg-slate-900/25 border border-slate-800 rounded-3xl p-7 text-left transition-all duration-300 hover:-translate-y-1 ${style.border} overflow-hidden min-h-[240px] flex flex-col justify-between`;

  const content = (
    <>
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${style.glow} pointer-events-none`} />
      <div className="relative z-10">
        <span className={`inline-flex px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em] ${style.badge}`}>
          {card.title}
        </span>
        <p className="text-gray-300 text-sm leading-relaxed mt-5">{card.description}</p>
      </div>
      <div className="relative z-10 mt-8 flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.text}`}>
          {card.cta}
        </span>
        <span className="text-gray-600 text-sm">→</span>
      </div>
    </>
  );

  if (card.type === 'external') {
    return (
      <a href={card.href} target="_blank" rel="noreferrer" className={sharedClassName}>
        {content}
      </a>
    );
  }

  return (
    <a href={card.href} className={sharedClassName}>
      {content}
    </a>
  );
};

const TcsNqtGuidePage = () => {
  const navigate = useNavigate();
  const username = getStoredUsername();

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-[-12%] left-[-8%] w-[45%] h-[45%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-8%] w-[45%] h-[45%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate(getDashboardPath(username))}
            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex w-fit cursor-pointer"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-12 bg-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Exam Guide</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                {TCS_NQT_GUIDE.title}<span className="text-cyan-400">.</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
                {TCS_NQT_GUIDE.subtitle}
              </p>
            </div>

            <div className="bg-slate-900/35 border border-slate-800 rounded-3xl px-5 py-4 max-w-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300 mb-2">Quick Strategy</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Solve aptitude with shortcuts first, treat reasoning as a pattern-recognition section, and use verbal as a fast scoring stabilizer.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          {TCS_NQT_GUIDE.overviewCards.map((card) => (
            <GuideCardLink key={card.id} card={card} />
          ))}
        </div>

        {TCS_NQT_GUIDE.sections.map((section) => {
          const style = accentStyles[section.accent] || accentStyles.cyan;

          return (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">
                <div className="max-w-2xl">
                  <span className={`inline-flex px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em] ${style.badge}`}>
                    {section.eyebrow}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-4">
                    {section.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {section.topics.map((topic) => (
                  <article
                    key={`${section.id}-${topic.title}`}
                    className={`relative bg-slate-900/20 border border-slate-800 rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${style.border}`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${style.glow} pointer-events-none`} />
                    <div className="relative z-10">
                      <h3 className="text-lg font-black tracking-tight text-white">
                        {topic.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mt-3">
                        {topic.summary}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <section className="bg-[#0b1121] border border-slate-800 rounded-3xl p-7 md:p-9">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-flex px-3 py-1 rounded-full border bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">
                Source Notes
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-4">
                Built from current TCS NQT topic coverage.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mt-3">
                This first version is focused on TCS NQT and uses current syllabus and practice-guide references to shape the section and topic cards.
              </p>
            </div>

            <Link
              to="/resources?category=DSA"
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-cyan-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
            >
              Explore Resource Hub
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
            {TCS_NQT_GUIDE.sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 px-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/25 transition-colors"
              >
                <span className="text-sm text-gray-300">{source.label}</span>
                <span className="text-cyan-300 text-xs font-black uppercase tracking-widest shrink-0">
                  Open
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TcsNqtGuidePage;
