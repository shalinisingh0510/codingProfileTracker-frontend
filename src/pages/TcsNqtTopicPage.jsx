import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { getStoredUsername } from '../utils/routes';

/* ──────────────────────────────────────────────
   Custom Markdown Components – Premium Styling
   ────────────────────────────────────────────── */
const markdownComponents = {
  /* ── Headings ── */
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-black text-white mt-12 mb-6 tracking-tight leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <div className="mt-12 mb-8">
      <h2 className="text-xl md:text-2xl font-black text-white pb-3 border-b border-slate-700/60 flex items-center gap-3">
        <span className="h-5 w-1.5 bg-emerald-400 rounded-full shrink-0" />
        {children}
      </h2>
    </div>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg md:text-xl font-bold text-emerald-300 mt-10 mb-4 flex items-center gap-2">
      <span className="text-emerald-500/50">▸</span>
      {children}
    </h3>
  ),

  /* ── Text ── */
  p: ({ children }) => (
    <p className="text-gray-300 leading-[1.9] mb-6 text-[15px] md:text-base tracking-wide">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-bold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-emerald-300/80 not-italic font-medium">{children}</em>
  ),

  /* ── Lists ── */
  ul: ({ children }) => (
    <ul className="pl-5 mb-8 space-y-4 text-gray-300 text-[15px] md:text-base">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-8 space-y-4 text-gray-300 text-[15px] md:text-base">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-300 leading-[1.8] pl-2 border-l-2 border-slate-800 ml-2">
      {children}
    </li>
  ),

  /* ── Tables ── */
  table: ({ children }) => (
    <div className="overflow-x-auto my-8 rounded-2xl border border-slate-700/50 bg-slate-900/20 shadow-lg">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-emerald-500/5 border-b border-slate-700/50">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-slate-800/50">{children}</tbody>
  ),
  th: ({ children }) => (
    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-emerald-400">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-5 py-4 text-gray-300 font-medium">{children}</td>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-slate-800/20 transition-colors">{children}</tr>
  ),

  /* ── Blockquotes (used as formula highlight cards) ── */
  blockquote: ({ children }) => (
    <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/15 shadow-lg">
      <div className="flex gap-3 items-start">
        <span className="text-emerald-400 text-lg mt-0.5 shrink-0">📐</span>
        <div className="text-gray-200 leading-[1.9] text-[15px] space-y-3 flex-1 [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  ),

  /* ── Horizontal Rules (section dividers) ── */
  hr: () => (
    <div className="my-12 flex items-center justify-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
      <span className="w-1 h-1 rounded-full bg-emerald-500/20" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
    </div>
  ),

  /* ── Code Blocks ── */
  code: ({ node, inline, className, children, ...props }) => {
    const isInline = !className || inline;
    if (isInline) {
      return (
        <code
          className="px-2 py-1 bg-slate-800/80 text-emerald-300 rounded-md font-mono text-[13px] border border-slate-700/40"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <div className="relative group my-8">
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => navigator.clipboard.writeText(String(children).trim())}
            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg cursor-pointer transition-all"
          >
            Copy
          </button>
        </div>
        <pre className="p-6 bg-[#070b15] rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs md:text-sm overflow-x-auto leading-relaxed shadow-inner">
          <code {...props}>{children}</code>
        </pre>
      </div>
    );
  },
};

/* ──────────────────────────────────────────────
   Markdown Parser – Separates sections
   ────────────────────────────────────────────── */
const parseTopicMarkdown = (markdown) => {
  if (!markdown) {
    return { theoryMarkdown: '', questions: [], revisionMarkdown: '' };
  }

  const lines = markdown.split('\n');
  let currentSection = 'theory';
  let theoryLines = [];
  let questionLines = [];
  let answerLines = [];
  let revisionLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      const heading = trimmed.toLowerCase();
      if (heading.includes('practice questions')) {
        currentSection = 'questions';
        continue;
      } else if (heading.includes('answers') || heading.includes('solutions')) {
        currentSection = 'answers';
        continue;
      } else if (
        heading.includes('revision') ||
        heading.includes('cheat sheet') ||
        heading.includes('revision card') ||
        heading.includes('last-minute')
      ) {
        currentSection = 'revision';
        continue;
      }
    }

    if (currentSection === 'theory') {
      theoryLines.push(line);
    } else if (currentSection === 'questions') {
      questionLines.push(line);
    } else if (currentSection === 'answers') {
      answerLines.push(line);
    } else if (currentSection === 'revision') {
      revisionLines.push(line);
    }
  }

  /* Parse individual questions */
  const questions = [];
  let currentQ = null;
  const qRegex = /^\s*(?:\*\*)?Q(\d+)\.?(?:\*\*)?\s*(.*)$/i;

  questionLines.forEach((line) => {
    const match = line.match(qRegex);
    if (match) {
      if (currentQ) questions.push(currentQ);
      currentQ = {
        id: parseInt(match[1]),
        text: match[2].trim(),
        options: [],
        rawTextLines: [match[2].trim()],
      };
    } else {
      if (currentQ) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          const optMatch = trimmedLine.match(
            /^\s*(?:\()?([A-D]|[a-d]|\d+)\s*[\)|:]\s*(.*)$/
          );
          if (optMatch) {
            currentQ.options.push({
              key: optMatch[1].toUpperCase(),
              text: optMatch[2].trim(),
            });
          } else {
            currentQ.rawTextLines.push(line);
          }
        }
      }
    }
  });
  if (currentQ) questions.push(currentQ);

  questions.forEach((q) => {
    q.text = q.rawTextLines.join('\n').trim();
  });

  /* Parse answers */
  const answers = {};
  let currentAId = null;
  const aRegex = /^\s*(?:\*\*)?A(\d+)\.?(?:\*\*)?\s*(.*)$/i;

  answerLines.forEach((line) => {
    const match = line.match(aRegex);
    if (match) {
      currentAId = parseInt(match[1]);
      answers[currentAId] = [match[2].trim()];
    } else {
      if (currentAId !== null) {
        answers[currentAId].push(line);
      }
    }
  });

  const parsedQuestions = questions.map((q) => {
    const ansLines = answers[q.id] || [];
    return {
      id: q.id,
      text: q.text,
      options: q.options,
      answerMarkdown: ansLines.join('\n').trim() || 'No explanation available.',
    };
  });

  return {
    theoryMarkdown: theoryLines.join('\n').trim(),
    questions: parsedQuestions,
    revisionMarkdown: revisionLines.join('\n').trim(),
  };
};

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */
const TcsNqtTopicPage = () => {
  const { sectionSlug, topicSlug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topicDetail, setTopicDetail] = useState(null);

  const [activeTab, setActiveTab] = useState('theory');
  const [parsedData, setParsedData] = useState({
    theoryMarkdown: '',
    questions: [],
    revisionMarkdown: '',
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [revealedSolutions, setRevealedSolutions] = useState({});
  const [scratchpads, setScratchpads] = useState({});
  const [solvedStatus, setSolvedStatus] = useState({});

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'https://codingprofiletracker-backend.onrender.com/api'}/exam-guides/tcs-nqt/sections/${sectionSlug}/topics/${topicSlug}`
        );
        if (!response.ok) throw new Error('Failed to fetch topic');

        const data = await response.json();
        if (!data?.topic?.contentMarkdown) throw new Error('Missing topic content');

        setTopicDetail(data.topic);
        const parsed = parseTopicMarkdown(data.topic.contentMarkdown);
        setParsedData(parsed);

        const storageKey = `progress-tcs-nqt-${sectionSlug}-${topicSlug}`;
        const storedProgress = localStorage.getItem(storageKey);
        if (storedProgress) {
          try {
            const p = JSON.parse(storedProgress);
            setSolvedStatus(p.solvedStatus || {});
            setUserAnswers(p.userAnswers || {});
            setScratchpads(p.scratchpads || {});
          } catch (e) {
            console.error('Error loading stored progress', e);
          }
        }
      } catch (err) {
        setError('This topic content is not available yet. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [sectionSlug, topicSlug]);

  useEffect(() => {
    if (!topicDetail) return;
    const storageKey = `progress-tcs-nqt-${sectionSlug}-${topicSlug}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ solvedStatus, userAnswers, scratchpads })
    );
  }, [solvedStatus, userAnswers, scratchpads, topicDetail, sectionSlug, topicSlug]);

  const solvedCount = Object.values(solvedStatus).filter(Boolean).length;
  const totalQuestions = parsedData.questions.length;
  const activeQuestion = parsedData.questions[activeQuestionIndex];

  const handleToggleSolved = (qId) => {
    setSolvedStatus((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };
  const handleRevealSolution = (qId) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  /* Shared Markdown render props */
  const mdPlugins = {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],
    components: markdownComponents,
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-24 px-4 md:px-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-12%] left-[-8%] w-[45%] h-[45%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-8%] w-[45%] h-[45%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* ── Breadcrumbs & Header ── */}
        <div className="flex flex-col gap-5">
          <Link
            to="/exam-guide/tcs-nqt"
            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex w-fit cursor-pointer transition-colors"
          >
            ← Back to TCS NQT Guide
          </Link>

          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
              {sectionSlug?.replace(/-/g, ' ')} Study Guide
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                {topicDetail?.title || topicSlug?.replace(/-/g, ' ')}
                <span className="text-emerald-400">.</span>
              </h1>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-lg">
                A structured, comprehensive prep guide designed for competitive placements
              </p>
            </div>

            {totalQuestions > 0 && (
              <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-4 min-w-[200px]">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-gray-400">Practice Progress</span>
                  <span className="text-emerald-400">
                    {solvedCount}/{totalQuestions}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalQuestions ? (solvedCount / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Loading / Error ── */}
        {loading ? (
          <div className="bg-[#0b1121] border border-slate-800 rounded-3xl p-24 flex items-center justify-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-[#0b1121] border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="text-red-400 mb-4 text-xl">⚠️</div>
            <div className="text-red-300 text-sm max-w-md">{error}</div>
            <button
              onClick={() => navigate('/exam-guide/tcs-nqt')}
              className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors cursor-pointer"
            >
              Go back
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── Tab Bar ── */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#0b1121] border border-slate-800 max-w-fit">
              <button
                onClick={() => setActiveTab('theory')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer ${
                  activeTab === 'theory'
                    ? 'bg-emerald-500 text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                📖 Theory Notes
              </button>
              {totalQuestions > 0 && (
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'practice'
                      ? 'bg-emerald-500 text-black shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  🧪 Practice Quiz
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black leading-none ${
                      activeTab === 'practice'
                        ? 'bg-black/10 text-black'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {totalQuestions}
                  </span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('revision')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer ${
                  activeTab === 'revision'
                    ? 'bg-emerald-500 text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                ⚡ Cheat Sheet
              </button>
            </div>

            {/* ── Content Area ── */}
            <div className="bg-[#0b1121] border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl relative">
              {/* ═══ THEORY TAB ═══ */}
              {activeTab === 'theory' && (
                <div className="prose prose-invert prose-emerald max-w-none leading-relaxed">
                  <Markdown {...mdPlugins}>
                    {parsedData.theoryMarkdown || '*No theory content loaded.*'}
                  </Markdown>
                </div>
              )}

              {/* ═══ PRACTICE QUIZ TAB ═══ */}
              {activeTab === 'practice' && activeQuestion && (
                <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8">
                  {/* Question list sidebar */}
                  <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-800 lg:pr-6">
                    {parsedData.questions.map((q, idx) => {
                      const isActive = idx === activeQuestionIndex;
                      const isSolved = !!solvedStatus[q.id];
                      return (
                        <button
                          key={q.id}
                          onClick={() => setActiveQuestionIndex(idx)}
                          className={`w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer shrink-0 lg:shrink ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-white font-bold'
                              : 'bg-slate-900/20 border-slate-800/60 hover:bg-slate-900/40 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <span>Q{q.id}</span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full border transition-colors ${
                              isSolved
                                ? 'bg-emerald-400 border-emerald-400'
                                : 'border-slate-700 bg-transparent'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Active question workspace */}
                  <div className="space-y-8">
                    {/* Question header */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-800 text-gray-300 rounded-lg">
                          Question {activeQuestion.id} of {totalQuestions}
                        </span>
                        {solvedStatus[activeQuestion.id] && (
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                            ✓ Solved
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-relaxed">
                        {activeQuestion.text}
                      </h3>
                    </div>

                    {/* Options or input */}
                    <div className="space-y-4">
                      {activeQuestion.options && activeQuestion.options.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeQuestion.options.map((opt) => {
                            const isSelected = userAnswers[activeQuestion.id] === opt.key;
                            return (
                              <button
                                key={opt.key}
                                onClick={() =>
                                  setUserAnswers((prev) => ({
                                    ...prev,
                                    [activeQuestion.id]: opt.key,
                                  }))
                                }
                                className={`text-left px-5 py-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white font-bold'
                                    : 'bg-slate-900/10 border-slate-800 hover:border-slate-700 text-gray-300'
                                }`}
                              >
                                <span className="inline-block w-6 text-emerald-400 font-black">
                                  {opt.key}.
                                </span>
                                {opt.text}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                            Your Answer
                          </label>
                          <input
                            type="text"
                            value={userAnswers[activeQuestion.id] || ''}
                            onChange={(e) =>
                              setUserAnswers((prev) => ({
                                ...prev,
                                [activeQuestion.id]: e.target.value,
                              }))
                            }
                            placeholder="Type your solution here (e.g. 120 or 25%)..."
                            className="w-full bg-[#070b15] border border-slate-800 focus:border-emerald-500/40 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none placeholder-gray-600 transition-colors"
                          />
                        </div>
                      )}
                    </div>

                    {/* Scratchpad */}
                    <div className="border border-slate-800 rounded-2xl bg-slate-900/15 overflow-hidden">
                      <div className="px-5 py-3 bg-slate-900/30 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          📝 Digital Scratchpad (Auto-saves)
                        </span>
                        {scratchpads[activeQuestion.id] && (
                          <button
                            onClick={() =>
                              setScratchpads((prev) => ({
                                ...prev,
                                [activeQuestion.id]: '',
                              }))
                            }
                            className="text-[9px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-wider cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <textarea
                        value={scratchpads[activeQuestion.id] || ''}
                        onChange={(e) =>
                          setScratchpads((prev) => ({
                            ...prev,
                            [activeQuestion.id]: e.target.value,
                          }))
                        }
                        placeholder="Write down formula steps or rough work here..."
                        className="w-full h-28 bg-transparent p-5 text-xs font-mono text-gray-300 focus:outline-none resize-none placeholder-gray-700 leading-relaxed"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800/50">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleSolved(activeQuestion.id)}
                          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-colors ${
                            solvedStatus[activeQuestion.id]
                              ? 'bg-emerald-500 border-emerald-500 text-black'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-gray-300'
                          }`}
                        >
                          {solvedStatus[activeQuestion.id] ? '✓ Solved' : 'Mark as Solved'}
                        </button>
                        <button
                          onClick={() => handleRevealSolution(activeQuestion.id)}
                          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-colors ${
                            revealedSolutions[activeQuestion.id]
                              ? 'bg-slate-800 border-slate-700 text-emerald-400 font-bold'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-gray-300'
                          }`}
                        >
                          {revealedSolutions[activeQuestion.id] ? 'Hide Solution' : 'Show Solution'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={activeQuestionIndex === 0}
                          onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          ←
                        </button>
                        <button
                          disabled={activeQuestionIndex === totalQuestions - 1}
                          onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          →
                        </button>
                      </div>
                    </div>

                    {/* Solution reveal */}
                    {revealedSolutions[activeQuestion.id] && (
                      <div className="p-8 rounded-2xl bg-gradient-to-b from-[#070d1a] to-[#040810] border border-emerald-500/25 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                          Step-by-Step Solution
                        </div>
                        <div className="prose prose-invert prose-emerald text-[15px] text-gray-300 leading-[1.9] max-w-none">
                          <Markdown {...mdPlugins}>{activeQuestion.answerMarkdown}</Markdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ CHEAT SHEET TAB ═══ */}
              {activeTab === 'revision' && (
                <div className="space-y-6">
                  {parsedData.revisionMarkdown ? (
                    <div className="prose prose-invert prose-emerald max-w-none leading-relaxed">
                      <Markdown {...mdPlugins}>{parsedData.revisionMarkdown}</Markdown>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-8 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl mb-3">⚡</span>
                        <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                          Quick-reference formulas and tricks extracted from the study material.
                          Review the <strong className="text-white">Theory Notes</strong> tab for detailed derivations.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TcsNqtTopicPage;
