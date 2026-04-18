import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, createResource, updateResource, deleteResource } from '../services/api';
import ResourceEditor from '../components/ResourceEditor';

const AdminDashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchResources();
  }, [user, navigate]);

  const fetchResources = async () => {
    try {
      const data = await getResources('All');
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedResource) {
        await updateResource(selectedResource._id, data);
      } else {
        await createResource(data);
      }
      setIsEditorOpen(false);
      setSelectedResource(null);
      fetchResources();
    } catch (error) {
      alert('Error saving resource: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        fetchResources();
      } catch (error) {
        alert('Error deleting resource');
      }
    }
  };

  const openEditor = (resource = null) => {
    setSelectedResource(resource);
    setIsEditorOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="animate-pulse text-cyan-500 font-black tracking-widest uppercase text-xs">Accessing Admin Core...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="h-px w-12 bg-indigo-400"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Control Center</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter">
              Admin Deck<span className="text-cyan-400">.</span>
            </h1>
          </div>

          <button
            onClick={() => openEditor()}
            className="px-10 py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/10 active:scale-95"
          >
            Create New Post +
          </button>
        </div>

        <div className="bg-[#0f172a]/20 border border-gray-800 rounded-[3rem] overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Resource</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Created</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {resources.length > 0 ? resources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{resource.title}</div>
                      <div className="text-[10px] text-gray-500 line-clamp-1 mt-1">{resource.description}</div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black border border-indigo-500/20">
                         {resource.category}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-mono">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => openEditor(resource)}
                           className="p-3 bg-gray-900 rounded-xl hover:bg-indigo-600 transition-colors text-xs"
                           title="Edit"
                         >
                           ✏️
                         </button>
                         <button 
                           onClick={() => handleDelete(resource._id)}
                           className="p-3 bg-gray-900 rounded-xl hover:bg-red-600 transition-colors text-xs"
                           title="Delete"
                         >
                           🗑️
                         </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-gray-600 italic">No resources found. Time to create some knowledge!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <ResourceEditor 
          existingResource={selectedResource}
          onSave={handleSave}
          onCancel={() => {
            setIsEditorOpen(false);
            setSelectedResource(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
