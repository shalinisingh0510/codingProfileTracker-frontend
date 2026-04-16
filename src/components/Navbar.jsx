import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="font-bold text-xl">CodeProfile Tracker</div>
      <div className="space-x-4">
        <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/login" className="hover:text-blue-400">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
