import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/api';

const ProfileField = ({ label, name, value, onChange, placeholder, icon, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-[#ba9eff] block mb-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#53ddfc] transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#0f172a]/40 border border-[#192540] rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#53ddfc]/50 focus:bg-[#0f172a]/60 transition-all font-medium placeholder:text-gray-600"
      />
    </div>
  </div>
);

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    leetcodeUsername: '',
    codeforcesHandle: '',
    gfgUsername: '',
    githubUsername: '',
    codechefUsername: '',
    hackerrankUsername: '',
    hackerearthUsername: '',
    profilePic: '',
    collegeName: '',
    skills: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setFormData({
          ...data,
          skills: data.skills ? data.skills.join(', ') : ''
        });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });
    
    try {
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      await updateUserProfile(updatedData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Update local storage name if changed
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...user, name: formData.name }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060e20] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#53ddfc]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] p-6 md:p-12 lg:p-20 font-sans selection:bg-[#ba9eff]/30 scroll-smooth">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
           <span className="h-px w-12 bg-[#ba9eff]"></span>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ba9eff]">Control Center</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-12">
          Profile Settings<span className="text-[#53ddfc]">.</span>
        </h1>

        {message.text && (
          <div className={`mb-8 p-6 rounded-3xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} animate-fade-in`}>
            <p className="text-sm font-bold flex items-center gap-2">
              {message.type === 'success' ? '✓' : '⚠'} {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Identity Section */}
          <div className="bg-[#0f1930]/40 p-8 md:p-10 rounded-[2.5rem] border border-[#192540] shadow-2xl">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
               <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">👤</span>
               Personal Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="Full Name" name="name" value={formData.name} onChange={handleChange} icon="📝" />
              <ProfileField label="Email Address" name="email" value={formData.email} onChange={handleChange} icon="📧" type="email" />
              <ProfileField label="Profile Picture URL" name="profilePic" value={formData.profilePic} onChange={handleChange} icon="🖼️" placeholder="https://..." />
              <ProfileField label="College Name" name="collegeName" value={formData.collegeName} onChange={handleChange} icon="🎓" />
              <div className="md:col-span-2">
                <ProfileField label="Skills (Comma separated)" name="skills" value={formData.skills} onChange={handleChange} icon="🛠️" placeholder="React, Node.js, C++, Python..." />
              </div>
            </div>
          </div>

          {/* Coding Platforms Section */}
          <div className="bg-[#0f1930]/40 p-8 md:p-10 rounded-[2.5rem] border border-[#192540] shadow-2xl">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
               <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-sm">⚡</span>
               Platform Synced Accounts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="LeetCode Username" name="leetcodeUsername" value={formData.leetcodeUsername} onChange={handleChange} icon="⚡" />
              <ProfileField label="GitHub Username" name="githubUsername" value={formData.githubUsername} onChange={handleChange} icon="🐙" />
              <ProfileField label="Codeforces Handle" name="codeforcesHandle" value={formData.codeforcesHandle} onChange={handleChange} icon="🏆" />
              <ProfileField label="GfG Username" name="gfgUsername" value={formData.gfgUsername} onChange={handleChange} icon="🌳" />
              <ProfileField label="CodeChef Username" name="codechefUsername" value={formData.codechefUsername} onChange={handleChange} icon="👨‍🍳" />
              <ProfileField label="HackerRank Username" name="hackerrankUsername" value={formData.hackerrankUsername} onChange={handleChange} icon="💻" />
              <ProfileField label="HackerEarth Username" name="hackerearthUsername" value={formData.hackerearthUsername} onChange={handleChange} icon="🌍" />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-[#53ddfc] hover:from-blue-700 hover:to-blue-400 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? 'Synchronizing Profile...' : 'Save All Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
