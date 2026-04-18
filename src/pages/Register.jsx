import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, checkUsername } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    leetcodeUsername: '',
    codeforcesHandle: '',
    gfgUsername: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  
  const navigate = useNavigate();

  // Debounced username check
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus(formData.username.length > 0 ? 'invalid' : null);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsername(formData.username);
        setUsernameStatus(result.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (usernameStatus !== 'available') {
      setError('Please choose a valid, available username.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const data = await register(formData);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const usernameIndicator = {
    checking: { text: 'Checking...', color: 'text-gray-400', icon: '⏳' },
    available: { text: 'Available!', color: 'text-emerald-400', icon: '✓' },
    taken: { text: 'Already taken', color: 'text-red-400', icon: '✕' },
    invalid: { text: 'Min 3 chars, letters/numbers/_ only', color: 'text-amber-400', icon: '⚠' },
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Join to track your coding profiles</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Username * <span className="text-gray-500 text-xs">(This will be your public ID)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  usernameStatus === 'available' ? 'border-emerald-500 focus:ring-emerald-500' :
                  usernameStatus === 'taken' ? 'border-red-500 focus:ring-red-500' :
                  'border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="e.g. coder_2722"
                required
                maxLength={20}
                minLength={3}
              />
              {usernameStatus && usernameIndicator[usernameStatus] && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs ${usernameIndicator[usernameStatus].color}`}>
                  <span>{usernameIndicator[usernameStatus].icon}</span>
                  <span className="hidden sm:inline">{usernameIndicator[usernameStatus].text}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">Coding Profiles</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  name="leetcodeUsername"
                  value={formData.leetcodeUsername}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                  placeholder="LeetCode Handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  name="codeforcesHandle"
                  value={formData.codeforcesHandle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Codeforces Handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  GeeksforGeeks Username
                </label>
                <input
                  type="text"
                  name="gfgUsername"
                  value={formData.gfgUsername}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="GFG Handle"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || usernameStatus !== 'available'}
            className={`w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              (isLoading || usernameStatus !== 'available') ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
