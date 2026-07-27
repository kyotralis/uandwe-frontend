import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { Image as ImageIcon, Link as LinkIcon, Type, AlignLeft, Trash2, Globe, LayoutTemplate, Newspaper, Edit2, X, Save } from 'lucide-react';
import { API_BASE_URL } from "../../config/constants.js"
import DashboardLayout, { DashboardContainer } from '../../components/dashboard/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

const AdminNewsFeeder = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    linkUrl: '',
    nationality: 'ALL',
    layoutOrder: 'IMAGE_FIRST',
    imageFile: null
  });
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [fetchingNews, setFetchingNews] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchNewsList();
  }, []);

  const fetchNewsList = async () => {
    setFetchingNews(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/news/latest`);
      if (res.data.success) {
        setNewsList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch news list:', err);
    } finally {
      setFetchingNews(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content && !formData.imageFile && !editId) {
      toast.error('Please provide an Image File or Content');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      if (editId) submitData.append('id', editId);
      if (formData.title) submitData.append('title', formData.title);
      if (formData.content) submitData.append('content', formData.content);
      if (formData.linkUrl) submitData.append('linkUrl', formData.linkUrl);
      if (formData.nationality) submitData.append('nationality', formData.nationality);
      if (formData.layoutOrder) submitData.append('layoutOrder', formData.layoutOrder);
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      }

      const res = await axios.post(`${API_BASE_URL}/api/news`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(editId ? 'News banner updated successfully!' : 'News banner published successfully!');
        setFormData({ title: '', content: '', linkUrl: '', nationality: 'ALL', layoutOrder: 'IMAGE_FIRST', imageFile: null });
        setEditId(null);
        const fileInput = document.getElementById('imageFileInput');
        if (fileInput) fileInput.value = '';
        fetchNewsList(); // Refresh the list
      }
    } catch (err) {
      console.error(err);
      toast.error(editId ? 'Failed to update news banner' : 'Failed to publish news banner');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (news) => {
    setEditId(news.id);
    setFormData({
      title: news.title || '',
      content: news.content || '',
      linkUrl: news.linkUrl || '',
      nationality: news.nationality || 'ALL',
      layoutOrder: news.layoutOrder || 'IMAGE_FIRST',
      imageFile: null
    });
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', content: '', linkUrl: '', nationality: 'ALL', layoutOrder: 'IMAGE_FIRST', imageFile: null });
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteNews = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/news/${id}`);
      if (res.data.success) {
        toast.success('News deleted successfully!');
        setDeleteConfirmId(null);
        fetchNewsList();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete news');
    }
  };


  return (
    <DashboardLayout>
      <DashboardHeader
        title="Admin News Feeder"
        subtitle="Manage the promotional banner shown to employees"
      />
      <DashboardContainer>
        <div className="max-w-2xl mx-auto font-['DM_Sans',sans-serif]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editId ? 'Edit News Item' : 'Create New Banner'}
              </h2>
              {editId && (
                <button 
                  type="button"
                  onClick={cancelEdit}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                >
                  <X size={16} /> Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Type size={16} className="text-gray-400" />
                  Banner Title 
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Partner Program Updates"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
              </div>

              {/* CONTENT TEXTAREA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <AlignLeft size={16} className="text-purple-500" />
                  Banner Content 
                </label>
                <textarea
                  name="content"
                  rows="4"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Type the news content here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
                />
              </div>

              {/* LINK URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <LinkIcon size={16} className="text-pink-500" />
                  Link URL 
                </label>
                <input
                  type="url"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
              </div>

              {/* IMAGE FILE UPLOAD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-500" />
                  Upload Image File 
                </label>
                <input
                  id="imageFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Upload an image directly from your computer (it will be saved to Google Drive).
                </p>
              </div>

              {/* NATIONALITY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe size={16} className="text-green-500" />
                  Target Nationality
                </label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                >
                  <option value="ALL">All Nationalities</option>
                  <option value="INDIA">India</option>
                  <option value="CHINA">China</option>
                  <option value="USA">USA</option>
                </select>
              </div>

              {/* LAYOUT ORDER */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <LayoutTemplate size={16} className="text-orange-500" />
                  Layout Order
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="layoutOrder" 
                      value="IMAGE_FIRST" 
                      checked={formData.layoutOrder === 'IMAGE_FIRST'}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Image First (Image above text)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="layoutOrder" 
                      value="TEXT_FIRST" 
                      checked={formData.layoutOrder === 'TEXT_FIRST'}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Text First (Text above image)</span>
                  </label>
                </div>
              </div>



              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (editId ? 'Updating...' : 'Publishing...') : (
                    <>
                      <Save size={18} /> {editId ? 'Update Banner' : 'Publish Banner'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ACTIVE NEWS LIST */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <Newspaper size={20} className="text-blue-500" />
              Active News Items ({newsList.length})
            </h2>

            {fetchingNews ? (
              <p className="text-gray-500 text-center py-4">Loading news...</p>
            ) : newsList.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active news items found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {newsList.map((news, idx) => (
                  <div key={news.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div>
                      <h3 className="font-bold text-gray-800">News {idx + 1} {news.title && `- ${news.title}`}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Target: {news.nationality === 'ALL' ? 'All Nationalities' : news.nationality} | 
                        Layout: {news.layoutOrder === 'IMAGE_FIRST' ? 'Image First' : 'Text First'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(news)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit News"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(news.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete News"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CUSTOM CONFIRMATION MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete News</h3>
                  <p className="text-sm text-gray-500 mt-1">Are you sure you want to delete this news item? This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNews(deleteConfirmId)}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default AdminNewsFeeder;
