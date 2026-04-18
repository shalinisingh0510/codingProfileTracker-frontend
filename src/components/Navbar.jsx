import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user?.username;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
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
    navigate('/login');
  };

  const handleResultClick = (resultUsername) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(`/${resultUsername}/dashboard`);
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
            C
          </div>
          <Link to={token ? "/dashboard" : "/login"} className="font-bold text-xl tracking-tight hover:text-blue-400 transition-colors hidden sm:block">
            CodeProfile <span className="text-blue-400">Tracker</span>
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
                placeholder="Search users by name or username..."
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
                    {result.collegeName && (
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider hidden lg:inline">{result.collegeName}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-2xl">
                <p className="text-sm text-gray-500 text-center">No users found</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-6">
          {token ? (
            <>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">@{username}</span>
              </div>
              <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              {user?.isAdmin && (
                <Link to="/admin-dashboard" className="text-sm font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">Admin</Link>
              )}
              <Link to={username ? `/${username}/profile` : '/profile'} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Profile</Link>
              <button 
                onClick={handleLogout}
                className="px-5 py-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-500 border border-gray-700 hover:border-red-500/50 rounded-xl text-sm font-semibold transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
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
    </nav>
  );
};

export default Navbar;
