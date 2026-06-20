import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TCS_NQT_GUIDE } from '../data/examGuides';
import { getDashboardPath, getStoredUsername, getStoredUser } from '../utils/routes';

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

const GuideCardLink = ({ card, onClick }) => {
  const style = accentStyles[card.accent] || accentStyles.cyan;

  const sharedClassName = `group relative bg-slate-900/25 border border-slate-800 rounded-3xl p-7 text-left transition-all duration-300 hover:-translate-y-1 ${style.border} overflow-hidden min-h-[240px] flex flex-col justify-between w-full cursor-pointer`;

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

  return (
    <button onClick={onClick} className={sharedClassName}>
      {content}
    </button>
  );
};

const TcsNqtGuidePage = () => {
  const navigate = useNavigate();
  const username = getStoredUsername();
  const user = getStoredUser();
  const [activeSectionId, setActiveSectionId] = useState(null);

  const activeSection = TCS_NQT_GUIDE.sections.find(s => s.id === activeSectionId);
  const hasAccess = user?.subscriptionTier === 'premium' || user?.tcsNqtSubscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-[-12%] left-[-8%] w-[45%] h-[45%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-8%] w-[45%] h-[45%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        <div className="flex flex-col gap-6">
          {!activeSectionId ? (
            <button
              onClick={() => navigate(getDashboardPath(username))}
              className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex w-fit cursor-pointer transition-colors"
            >
              ← Back to Dashboard
            </button>
          ) : (
            <button
              onClick={() => setActiveSectionId(null)}
              className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex w-fit cursor-pointer transition-colors"
            >
              ← Back to Overview
            </button>
          )}

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

        {!activeSectionId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
            {TCS_NQT_GUIDE.overviewCards.map((card) => (
              <GuideCardLink 
                key={card.id} 
                card={card} 
                onClick={() => setActiveSectionId(card.id)} 
              />
            ))}
          </div>
        ) : (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {activeSection && (() => {
              const style = accentStyles[activeSection.accent] || accentStyles.cyan;
              return (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">
                    <div className="max-w-2xl">
                      <span className={`inline-flex px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em] ${style.badge}`}>
                        {activeSection.eyebrow}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-4">
                        {activeSection.title}
                      </h2>
                      <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                        {activeSection.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {activeSection.topics.map((topic, index) => {
                      const isLocked = !hasAccess;
                      
                      if (isLocked) {
                        return (
                          <article
                            key={`${activeSection.id}-locked-${index}`}
                            className="relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 group"
                          >
                            <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center pointer-events-none transition-all group-hover:bg-[#020617]/60">
                              <span className="text-3xl mb-3 opacity-80 group-hover:scale-110 transition-transform">🔒</span>
                              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                Premium / TCS NQT Pass
                              </span>
                            </div>
                            <div className="relative z-10 opacity-30 filter blur-[2px] pointer-events-none">
                              <span className="text-lg font-black tracking-tight text-white text-left w-full block">
                                {topic.title}
                              </span>
                              <p className="text-gray-400 text-sm leading-relaxed mt-3">
                                {topic.summary}
                              </p>
                            </div>
                            <Link
                              to="/pricing"
                              className="absolute inset-0 z-30 flex items-end justify-center pb-6"
                            >
                              <span className="text-xs font-bold text-white hover:text-emerald-400 transition-colors uppercase tracking-wider underline underline-offset-4 decoration-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                Unlock Now →
                              </span>
                            </Link>
                          </article>
                        );
                      }

                      return (
                      <article
                        key={`${activeSection.id}-${topic.title}`}
                        className={`relative bg-slate-900/20 border border-slate-800 rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${style.border}`}
                      >
                        <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${style.glow} pointer-events-none`} />
                        <div className="relative z-10">
                          {topic.topicSlug ? (
                            <Link
                              to={`/exam-guide/tcs-nqt/${activeSection.id}/${topic.topicSlug}`}
                              className={`text-lg font-black tracking-tight text-white text-left w-full cursor-pointer block ${style.text.replace('text-', 'hover:text-')}`}
                            >
                              {topic.title}
                            </Link>
                          ) : (
                            <span className="text-lg font-black tracking-tight text-white text-left w-full cursor-default block">
                              {topic.title}
                            </span>
                          )}
                          <p className="text-gray-400 text-sm leading-relaxed mt-3">
                            {topic.summary}
                          </p>
                          {topic.topicSlug && (
                            <Link
                              to={`/exam-guide/tcs-nqt/${activeSection.id}/${topic.topicSlug}`}
                              className={`text-[10px] font-black uppercase tracking-[0.25em] text-gray-600 transition-colors mt-5 inline-block ${style.text.replace('text-', 'hover:text-')}`}
                            >
                              Open {activeSection.id === 'previous-year-papers' || activeSection.id === 'coding-questions' ? 'paper/quiz' : 'full notes'}
                            </Link>
                          )}
                        </div>
                      </article>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </section>
        )}
      </div>
    </div>
  );
};

export default TcsNqtGuidePage;
