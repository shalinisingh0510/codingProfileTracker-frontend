import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchUsers, getLastAiReport, getBookmarks, getReadingHistory } from '../services/api';
import Markdown from 'react-markdown';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user?.username;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  // AI report states
  const [aiReport, setAiReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Bookmarks & History states
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' or 'history'
  
  // Detailed reader state inside navbar for direct launch
  const [activeViewResource, setActiveViewResource] = useState(null);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close search dropdown and profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowDropdown(false);
    navigate('/login');
  };

  const handleResultClick = (resultUsername) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(`/${resultUsername}/dashboard`);
  };

  // Fetch last AI analysis report
  const handleFetchLastReport = async () => {
    setShowDropdown(false);
    setReportLoading(true);
    setShowReportModal(true);
    try {
      const data = await getLastAiReport();
      if (data && data.report) {
        setAiReport(data.report);
      } else {
        setAiReport("### No Analysis Found\n\nYou have not analyzed your profile yet! Go to your Dashboard and click **Analyze Profile with Groq AI** to generate your first technical evaluation report.");
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setAiReport("### Failed to retrieve analysis report\n\nEnsure your backend server is fully active and running on port 5050.");
    } finally {
      setReportLoading(false);
    }
  };

  // Fetch Bookmarks & Reading History
  const handleOpenBookmarks = async () => {
    setShowDropdown(false);
    setShowBookmarksModal(true);
    setBookmarksLoading(true);
    try {
      const bookmarkedData = await getBookmarks();
      const historyData = await getReadingHistory();
      setBookmarks(bookmarkedData || []);
      setHistory(historyData || []);
    } catch (error) {
      console.error("Failed to retrieve bookmarks/history:", error);
    } finally {
      setBookmarksLoading(false);
    }
  };

  // Get User initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'CP';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Render dynamic subscriber badge
  const renderTierBadge = () => {
    const tier = user?.subscriptionTier || 'free';
    if (tier === 'premium') {
      return (
        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/40 text-[9px] font-black uppercase tracking-widest text-yellow-400 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]">
          👑 Premium
        </span>
      );
    } else if (tier === 'plus') {
      return (
        <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-black uppercase tracking-widest text-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.15)]">
          ⭐ Plus
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[9px] font-black uppercase tracking-widest text-gray-400 rounded-full">
        Slate Free
      </span>
    );
  };

  // Determine avatar border colors
  const getAvatarBorderClass = () => {
    const tier = user?.subscriptionTier || 'free';
    if (tier === 'premium') return 'border-2 border-yellow-500 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]';
    if (tier === 'plus') return 'border-2 border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]';
    return 'border border-gray-700 hover:border-gray-500';
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <Link to={token ? (username ? `/${username}/dashboard` : "/dashboard") : "/login"} className="flex items-center gap-4 group">
            <img 
              src="/logo.png" 
              alt="CodeProfile" 
              className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
            />
            <span className="font-black text-2xl tracking-tighter hover:text-cyan-400 transition-colors hidden sm:block">
              CodeProfile<span className="text-cyan-400">.</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        {token && (
          <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name..."
                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs animate-pulse">...</span>
              )}
            </div>

            {/* Dropdown Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50 max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => handleResultClick(result.username)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left"
                  >
                    {result.profilePic ? (
                      <img src={result.profilePic} alt="" className="w-9 h-9 rounded-xl object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white">
                        {result.name?.[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{result.name}</p>
                      <p className="text-xs text-gray-400 truncate">@{result.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-6">
          {token ? (
            <div className="relative" ref={dropdownRef}>
              {/* INTERACTIVE PROFILE AVATAR ICON */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black overflow-hidden transition-all duration-300 cursor-pointer ${getAvatarBorderClass()}`}
              >
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-sm tracking-tighter text-white">
                    {getUserInitials()}
                  </div>
                )}
              </button>

              {/* SLEEK GLASSMORPHIC DROPDOWN MENU */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-950/95 backdrop-blur-3xl border border-slate-800 rounded-3xl p-5 shadow-2xl shadow-black/80 flex flex-col gap-1 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Profile Header */}
                  <div className="px-3 py-3 border-b border-slate-800/80 mb-3 text-left">
                    <p className="font-black text-white text-base leading-tight truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 leading-none mt-1 truncate">@{username}</p>
                    <div className="mt-3 flex items-center justify-between">
                      {renderTierBadge()}
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Member ID: #{user?._id?.substring(18)}</span>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <Link 
                    to={username ? `/${username}/dashboard` : '/dashboard'} 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-900/60 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    <span>📊</span> User Dashboard
                  </Link>

                  <Link 
                    to={username ? `/${username}/profile` : '/profile'} 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-900/60 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    <span>⚙️</span> Profile & Settings
                  </Link>

                  <button
                    onClick={handleOpenBookmarks}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-900/60 text-sm font-semibold text-gray-300 hover:text-white text-left transition-colors cursor-pointer"
                  >
                    <span>🔖</span> Bookmarks & History
                  </button>

                  <button
                    onClick={handleFetchLastReport}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-900/60 text-sm font-semibold text-gray-300 hover:text-white text-left transition-colors cursor-pointer"
                  >
                    <span>🧠</span> Last AI Profile Coach Report
                  </button>

                  <Link 
                    to="/pricing" 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-900/60 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>👑</span> Manage Subscription Tiers
                  </Link>

                  <div className="border-t border-slate-800/80 my-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-sm font-semibold text-red-400 hover:text-red-300 text-left transition-colors cursor-pointer"
                    >
                      <span>🚪</span> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium mr-2">Pricing</Link>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log In</Link>
              <Link 
                to="/register" 
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 🧠 MY LAST AI REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1121] border border-gray-800 rounded-[3rem] w-full max-w-5xl p-8 md:p-16 relative animate-in zoom-in-95 duration-300 my-10 max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors text-3xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-12 border-b border-slate-800/80 pb-6">
              <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-cyan-500/20 mb-6 inline-block">
                AI Coach Assessment
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                Last Profile Analysis Report<span className="text-cyan-400">.</span>
              </h2>
            </div>

            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm font-medium animate-pulse">Loading technical assessment...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-loose text-lg custom-markdown">
                <Markdown>{aiReport}</Markdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔖 BOOKMARKS & READING HISTORY MODAL */}
      {showBookmarksModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1121] border border-gray-800 rounded-[3rem] w-full max-w-4xl p-8 md:p-12 relative animate-in zoom-in-95 duration-300 my-10 max-h-[85vh] overflow-y-auto custom-scrollbar text-left flex flex-col gap-6">
            <button 
              onClick={() => setShowBookmarksModal(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors text-2xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                Syllabus Tracker & Logs<span className="text-cyan-400">.</span>
              </h2>
              <p className="text-gray-500 text-xs mt-1 font-bold">Keep tabs on modules you've saved or recently studied.</p>
            </div>

            {/* TAB BUTTONS */}
            <div className="flex border-b border-slate-800/80 gap-6">
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative cursor-pointer ${
                  activeTab === 'bookmarks' ? 'text-cyan-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                🔖 Bookmarked Modules
                {activeTab === 'bookmarks' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></span>}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative cursor-pointer ${
                  activeTab === 'history' ? 'text-cyan-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                ⏳ Reading History
                {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></span>}
              </button>
            </div>

            {/* CONTENT */}
            {bookmarksLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'bookmarks' ? (
                  bookmarks.length > 0 ? (
                    bookmarks.map(resource => (
                      <div 
                        key={resource._id}
                        className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex justify-between items-center hover:border-cyan-500/30 transition-all gap-4"
                      >
                        <div className="min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400/80 bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded-full">
                            {resource.category}
                          </span>
                          <h4 className="text-base font-black text-white mt-2 truncate">{resource.title}</h4>
                          <p className="text-gray-500 text-xs truncate mt-0.5">{resource.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowBookmarksModal(false);
                            setActiveViewResource(resource);
                          }}
                          className="px-4 py-2 bg-gray-900 hover:bg-cyan-500 hover:text-black border border-slate-800 hover:border-cyan-500/30 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer"
                        >
                          Launch ↗
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 text-gray-500 italic text-sm border border-dashed border-slate-800/80 rounded-2xl">
                      No bookmarks saved yet. Star any card in the Resource Hub to save it!
                    </div>
                  )
                ) : (
                  history.length > 0 ? (
                    history.map(resource => (
                      <div 
                        key={resource._id}
                        className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex justify-between items-center hover:border-cyan-500/30 transition-all gap-4"
                      >
                        <div className="min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400/80 bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded-full">
                            {resource.category}
                          </span>
                          <h4 className="text-base font-black text-white mt-2 truncate">{resource.title}</h4>
                          <p className="text-gray-500 text-xs truncate mt-0.5">{resource.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowBookmarksModal(false);
                            setActiveViewResource(resource);
                          }}
                          className="px-4 py-2 bg-gray-900 hover:bg-cyan-500 hover:text-black border border-slate-800 hover:border-cyan-500/30 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer"
                        >
                          Review ↗
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 text-gray-500 italic text-sm border border-dashed border-slate-800/80 rounded-2xl">
                      No read history logs. Click "Launch Module" in the Resource Hub to record progress.
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEDICATED LIGHTWEIGHT RESOURCE READER FROM NAVBAR */}
      {activeViewResource && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1121] border border-gray-800 rounded-[3rem] w-full max-w-5xl p-8 md:p-16 relative animate-in zoom-in-95 duration-300 my-10 max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            <button 
              onClick={() => {
                setActiveViewResource(null);
                setShowBookmarksModal(true); // Return to list on close
              }}
              className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors text-3xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-12">
              <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-cyan-500/20 mb-6 inline-block">
                {activeViewResource.category}
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                {activeViewResource.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                <span>By {activeViewResource.author?.name || 'Admin'}</span>
                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                <span>{new Date(activeViewResource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div 
              className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-loose text-lg"
              dangerouslySetInnerHTML={{ __html: activeViewResource.content }}
            />

            {activeViewResource.link && (
              <div className="mt-16 pt-10 border-t border-gray-800">
                <a 
                  href={activeViewResource.link} 
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
    </nav>
  );
};

export default Navbar;
