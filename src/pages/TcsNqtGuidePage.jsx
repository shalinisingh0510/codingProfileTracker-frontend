import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [activeResourceTab, setActiveResourceTab] = useState(TCS_NQT_GUIDE.resourceTabs[0]?.id || '');
  const [selectedResourceId, setSelectedResourceId] = useState(TCS_NQT_GUIDE.resourceTabs[0]?.resources?.[0]?.id || '');
  const [resourceText, setResourceText] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const [textError, setTextError] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState('');
  const [topicDetail, setTopicDetail] = useState(null);

  const currentTab = useMemo(
    () => TCS_NQT_GUIDE.resourceTabs.find((tab) => tab.id === activeResourceTab) || TCS_NQT_GUIDE.resourceTabs[0],
    [activeResourceTab],
  );

  const selectedResource = useMemo(
    () => currentTab?.resources.find((resource) => resource.id === selectedResourceId) || currentTab?.resources?.[0] || null,
    [currentTab, selectedResourceId],
  );

  useEffect(() => {
    if (!currentTab) return;

    const resourceExists = currentTab.resources.some((resource) => resource.id === selectedResourceId);
    if (!resourceExists) {
      setSelectedResourceId(currentTab.resources[0]?.id || '');
    }
  }, [currentTab, selectedResourceId]);

  useEffect(() => {
    const shouldFetchText = selectedResource && ['markdown', 'text', 'csv', 'ipynb'].includes(selectedResource.kind);

    if (!shouldFetchText) {
      setResourceText('');
      setTextError('');
      setLoadingText(false);
      return;
    }

    let isMounted = true;

    const fetchText = async () => {
      setLoadingText(true);
      setTextError('');

      try {
        const response = await fetch(selectedResource.downloadUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch resource');
        }

        const text = await response.text();
        if (isMounted) {
          setResourceText(text);
        }
      } catch {
        if (isMounted) {
          setTextError('Unable to load this text resource right now.');
          setResourceText('');
        }
      } finally {
        if (isMounted) {
          setLoadingText(false);
        }
      }
    };

    fetchText();

    return () => {
      isMounted = false;
    };
  }, [selectedResource]);

  const renderResourcePreview = () => {
    if (!selectedResource) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 px-6 py-16 text-center text-gray-500">
          Select a resource to preview it here.
        </div>
      );
    }

    if (selectedResource.kind === 'pdf') {
      return (
        <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/80">
          <iframe
            title={selectedResource.title}
            src={selectedResource.downloadUrl}
            className="w-full h-[720px] bg-white"
          />
        </div>
      );
    }

    if (selectedResource.kind === 'external') {
      return (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
          <span className="inline-flex px-3 py-1 rounded-full border bg-indigo-500/10 border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">
            Coding Link
          </span>
          <h3 className="text-2xl font-black tracking-tight text-white mt-5">
            {selectedResource.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mt-3 max-w-2xl">
            {selectedResource.description}
          </p>
          <a
            href={selectedResource.viewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-cyan-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors mt-6"
          >
            Open coding sheet
          </a>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
            Text Preview
          </span>
          <a
            href={selectedResource.viewUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 hover:text-white transition-colors"
          >
            Open source
          </a>
        </div>
        <div className="p-6 max-h-[720px] overflow-auto">
          {loadingText ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : textError ? (
            <div className="text-red-300 text-sm">{textError}</div>
          ) : selectedResource.kind === 'markdown' ? (
            <div className="prose prose-invert prose-cyan max-w-none text-gray-300">
              <Markdown remarkPlugins={[remarkGfm]}>{resourceText}</Markdown>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-300 font-mono leading-relaxed">
              {resourceText}
            </pre>
          )}
        </div>
      </div>
    );
  };

  const openAptitudeTopic = async (topic) => {
    const topicSlug = topic?.topicSlug;
    if (!topicSlug) return;

    setShowTopicModal(true);
    setTopicLoading(true);
    setTopicError('');
    setTopicDetail(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://codingprofiletracker-backend.onrender.com/api'}/exam-guides/tcs-nqt/sections/aptitude/topics/${topicSlug}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch topic');
      }

      const data = await response.json();
      if (!data?.topic?.contentMarkdown) {
        throw new Error('Missing topic content');
      }

      setTopicDetail(data.topic);
    } catch {
      setTopicError('This topic content is not available yet. Please try again later.');
    } finally {
      setTopicLoading(false);
    }
  };

  const closeTopicModal = () => {
    setShowTopicModal(false);
    setTopicDetail(null);
    setTopicError('');
    setTopicLoading(false);
  };

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

        <section id="resource-library-section" className="scroll-mt-28 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-3xl">
              <span className="inline-flex px-3 py-1 rounded-full border bg-cyan-500/10 border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                Resource Library
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-4">
                TCS NQT repo resources inside the guide.
              </h2>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                These tabs are built from the shared GitHub repo so users can browse memory-based papers, prep PDFs, and notes from one place before opening the original source.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 p-2 rounded-3xl bg-slate-900/35 border border-slate-800">
            {TCS_NQT_GUIDE.resourceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveResourceTab(tab.id)}
                className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                  activeResourceTab === tab.id
                    ? 'bg-cyan-500 text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
            <div className="space-y-4">
              <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-5">
                <p className="text-white font-black tracking-tight text-lg">{currentTab?.label}</p>
                <p className="text-gray-400 text-sm leading-relaxed mt-2">
                  {currentTab?.description}
                </p>
              </div>

              <div className="space-y-3">
                {currentTab?.resources.map((resource) => {
                  const isSelected = resource.id === selectedResource?.id;
                  return (
                    <button
                      key={resource.id}
                      onClick={() => setSelectedResourceId(resource.id)}
                      className={`w-full text-left rounded-3xl border p-5 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-slate-900/20 border-slate-800 hover:border-slate-700 hover:bg-slate-900/35'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white font-black tracking-tight text-base">
                          {resource.title}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                            : 'bg-white/5 border-white/5 text-gray-400'
                        }`}>
                          {resource.format}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mt-3">
                        {resource.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    Selected Resource
                  </p>
                  <h3 className="text-2xl font-black tracking-tight text-white mt-2">
                    {selectedResource?.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2 max-w-2xl">
                    {selectedResource?.description}
                  </p>
                </div>
                {selectedResource?.viewUrl && (
                  <a
                    href={selectedResource.viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors shrink-0"
                  >
                    Open source
                  </a>
                )}
              </div>

              {renderResourcePreview()}
            </div>
          </div>
        </section>

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
                      <button
                        onClick={() => {
                          if (section.id === 'aptitude-section') {
                            openAptitudeTopic(topic);
                          }
                        }}
                        disabled={section.id !== 'aptitude-section'}
                        className={`text-lg font-black tracking-tight text-white text-left w-full ${
                          section.id === 'aptitude-section' ? 'hover:text-emerald-300 cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        {topic.title}
                      </button>
                      <p className="text-gray-400 text-sm leading-relaxed mt-3">
                        {topic.summary}
                      </p>
                      {section.id === 'aptitude-section' && (
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600 mt-5">
                          Open full notes
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {showTopicModal && (
          <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-5">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-[#0b1121] border border-slate-800 rounded-3xl shadow-2xl flex flex-col">
              <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                    Aptitude Topic
                  </p>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-white truncate">
                    {topicDetail?.title || 'Loading...'}
                  </h3>
                </div>
                <button
                  onClick={closeTopicModal}
                  className="w-10 h-10 rounded-2xl border border-slate-800 bg-slate-950/60 text-gray-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-auto">
                {topicLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
                  </div>
                ) : topicError ? (
                  <div className="text-red-300 text-sm">{topicError}</div>
                ) : (
                  <div className="prose prose-invert prose-cyan max-w-none text-gray-300">
                    <Markdown remarkPlugins={[remarkGfm]}>{topicDetail?.contentMarkdown || ''}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
