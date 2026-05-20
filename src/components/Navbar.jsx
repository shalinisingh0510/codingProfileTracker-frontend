import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchUsers, getLastAiReport, getBookmarks, getReadingHistory } from '../services/api';
import Markdown from 'react-markdown';

const RESOURCE_CATEGORIES = ['All', 'DSA', 'System Design', 'Backend', 'Frontend', 'Full stack', 'Cloud', 'Ci/cd', 'Misc'];

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
  const [activeTab, setActiveTab] = useState('bookmarks');

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

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

  const handleFetchLastReport = async () => {
    setShowDropdown(false);
    setReportLoading(true);
    setShowReportModal(true);
    try {
      const data = await getLastAiReport();
      if (data && data.report) {
        setAiReport(data.report);
      } else {
        setAiReport("### No Analysis Found\n\nYou haven't analyzed your profile yet. Go to your Dashboard and click **Analyze Profile** to generate your first report.");
      }
    } catch (error) {
      setAiReport("### Error\n\nFailed to load report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleOpenBookmarks = async () => {
    setShowDropdown(false);
    setShowBookmarksModal(true);
    setBookmarksLoading(true);
    try {
      const [bookmarkedData, historyData] = await Promise.all([getBookmarks(), getReadingHistory()]);
      setBookmarks(bookmarkedData || []);
      setHistory(historyData || []);
    } catch (error) {
      console.error("Failed to retrieve bookmarks/history:", error);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderTierBadge = () => {
    const tier = user?.subscriptionTier || 'free';
    if (tier === 'premium') {
      return <span className="px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/30 text-[9px] font-black uppercase tracking-widest text-yellow-400 rounded-full">Premium</span>;
    } else if (tier === 'plus') {
      return <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-black uppercase tracking-widest text-cyan-400 rounded-full">Plus</span>;
    }
    return <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[9px] font-black uppercase tracking-widest text-gray-500 rounded-full">Free</span>;
  };

  const getAvatarBorderClass = () => {
    const tier = user?.subscriptionTier || 'free';
    if (tier === 'premium') return 'ring-2 ring-yellow-500/60';
    if (tier === 'plus') return 'ring-2 ring-cyan-400/60';
    return 'ring-1 ring-gray-700';
  };

  const navigateToResource = (resource) => {
    setShowBookmarksModal(false);
    const identifier = resource.slug || resource._id;
    navigate(`/resources/${identifier}`);
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
        {/* Left: Logo */}
        <Link to={token ? (username ? `/${username}/dashboard` : "/dashboard") : "/login"} className="flex items-center gap-3 group shrink-0">
          <img 
            src="/logo.png" 
            alt="CodeProfile" 
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" 
          />
          <span className="font-black text-xl tracking-tighter hover:text-cyan-400 transition-colors hidden sm:block">
            CodeProfile<span className="text-cyan-400">.</span>
          </span>
        </Link>

        {/* Center: Search */}
        {token && (
          <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80 mx-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-4 py-2 bg-gray-800/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {isSearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs animate-pulse">...</span>
            )}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50 max-h-72 overflow-y-auto z-50">
                {searchResults.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => handleResultClick(result.username)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left"
                  >
                    {result.profilePic ? (
                      <img src={result.profilePic} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white">
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

        {/* Right: Nav items */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Resources Dropdown */}
          <div className="relative group hidden md:block">
            <Link
              to="/resources"
              className="px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5"
            >
              Resources
              <svg className="w-3 h-3 opacity-40 group-hover:opacity-70 group-hover:rotate-180 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <div className="absolute left-0 mt-0 pt-1 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-slate-950/98 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 shadow-2xl shadow-black/60">
                {RESOURCE_CATEGORIES.map(cat => (
                  <Link
                    key={cat}
                    to={`/resources?category=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 rounded-lg text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {token ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black overflow-hidden transition-all duration-200 cursor-pointer ${getAvatarBorderClass()}`}
              >
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs text-white">
                    {getUserInitials()}
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-950/98 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl shadow-black/70 z-[100]">
                  {/* User header */}
                  <div className="px-3 py-3 border-b border-slate-800/60 mb-1">
                    <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">@{username}</p>
                    <div className="mt-2">{renderTierBadge()}</div>
                  </div>

                  <Link 
                    to={username ? `/${username}/dashboard` : '/dashboard'} 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>

                  <Link 
                    to={username ? `/${username}/profile` : '/profile'} 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Settings
                  </Link>

                  <button
                    onClick={handleOpenBookmarks}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white text-left transition-colors cursor-pointer"
                  >
                    Bookmarks & History
                  </button>

                  <button
                    onClick={handleFetchLastReport}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white text-left transition-colors cursor-pointer"
                  >
                    Last AI Report
                  </button>

                  <Link 
                    to="/pricing" 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Subscription
                  </Link>

                  {user?.isAdmin && (
                    <Link 
                      to="/admin-dashboard" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-slate-800/60 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 text-left transition-colors cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium hidden sm:block">Pricing</Link>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log In</Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* AI Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1121] border border-gray-800 rounded-3xl w-full max-w-4xl p-8 md:p-14 relative my-10 max-h-[90vh] overflow-y-auto text-left">
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors text-xl cursor-pointer"
            >
              ✕
            </button>
            <div className="mb-10 border-b border-slate-800/60 pb-5">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-500/20 mb-4 inline-block">
                AI Assessment
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Profile Analysis Report
              </h2>
            </div>
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-relaxed text-base">
                <Markdown>{aiReport}</Markdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks & History Modal */}
      {showBookmarksModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1121] border border-gray-800 rounded-3xl w-full max-w-3xl p-8 md:p-10 relative my-10 max-h-[85vh] overflow-y-auto text-left flex flex-col gap-5">
            <button 
              onClick={() => setShowBookmarksModal(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors text-xl cursor-pointer"
            >
              ✕
            </button>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Bookmarks & History
              </h2>
              <p className="text-gray-500 text-xs mt-1">Your saved resources and reading activity.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-800/60">
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                  activeTab === 'bookmarks' ? 'text-cyan-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                Bookmarks ({bookmarks.length})
                {activeTab === 'bookmarks' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                  activeTab === 'history' ? 'text-cyan-400' : 'text-gray-500 hover:text-white'
                }`}
              >
                History ({history.length})
                {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></span>}
              </button>
            </div>

            {bookmarksLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {(activeTab === 'bookmarks' ? bookmarks : history).length > 0 ? (
                  (activeTab === 'bookmarks' ? bookmarks : history).map(resource => (
                    <button
                      key={resource._id}
                      onClick={() => navigateToResource(resource)}
                      className="w-full p-4 bg-slate-900/30 border border-slate-800/60 rounded-xl flex items-center justify-between hover:border-cyan-500/20 hover:bg-slate-900/50 transition-all text-left cursor-pointer gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-500/60">{resource.category}</span>
                          {resource.isLocked && <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400/70">Locked</span>}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{resource.title}</h4>
                      </div>
                      <span className="text-gray-600 text-xs shrink-0">→</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-14 text-gray-600 text-sm italic">
                    {activeTab === 'bookmarks' ? 'No bookmarks yet.' : 'No reading history yet.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
