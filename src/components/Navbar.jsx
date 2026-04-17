import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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

        <div className="flex items-center gap-6">
          {token ? (
            <>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Developer</span>
              </div>
              <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/profile" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Profile</Link>
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
