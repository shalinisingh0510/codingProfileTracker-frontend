import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ResourceEditor = ({ existingResource, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    description: '',
    content: '',
    tags: '',
    link: ''
  });

  useEffect(() => {
    if (existingResource) {
      setFormData({
        ...existingResource,
        tags: existingResource.tags.join(', ')
      });
    }
  }, [existingResource]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };
    onSave(dataToSubmit);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-gray-800 rounded-[2.5rem] w-full max-w-4xl p-8 md:p-12 shadow-2xl relative animate-in zoom-in-95 duration-300 my-8">
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors text-2xl"
        >
          ✕
        </button>

        <h2 className="text-4xl font-black text-white mb-10 tracking-tight">
          {existingResource ? 'Edit Resource' : 'Create New Material'}<span className="text-cyan-400">.</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#060e20] border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                placeholder="e.g. Mastering DP Patterns"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#060e20] border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-500/50 outline-none transition-all appearance-none"
              >
                <option value="DSA">DSA</option>
                <option value="System Design">System Design</option>
                <option value="Resume">Resume</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Short Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full bg-[#060e20] border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-500/50 outline-none transition-all"
              placeholder="A brief summary for the preview card..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Content Body</label>
            <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#060e20]">
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={handleContentChange}
                modules={modules}
                className="text-white min-h-[300px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Tags (Comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-[#060e20] border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                placeholder="e.g. Logic, Patterns, Placement"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">External Link (Optional)</label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full bg-[#060e20] border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
            >
              {existingResource ? 'Save Changes' : 'Publish Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceEditor;
