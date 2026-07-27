import React, { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardLayout, { DashboardContainer } from "../../components/dashboard/DashboardLayout"
import { Newspaper, ExternalLink, X, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/constants.js'
import DashboardHeader from '../../components/dashboard/DashboardHeader';

const extractDriveId = (url) => {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /\/d\/([a-zA-Z0-9_-]{10,})\//,
    /[?&]id=([a-zA-Z0-9_-]{10,})/,
    /open\?id=([a-zA-Z0-9_-]{10,})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const NewsImage = ({ src, alt, className }) => {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const driveId = extractDriveId(src);
  const imgSources = driveId ? [
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${driveId}`,
    `https://lh3.googleusercontent.com/d/${driveId}=s1000`,
  ] : (src ? [src] : []);

  const currentImgSrc = imgSources[fallbackIndex] || null;

  const handleError = () => {
    setFallbackIndex(prev => (prev < imgSources.length - 1 ? prev + 1 : prev));
  };

  if (!currentImgSrc) return null;

  return (
    <img
      key={fallbackIndex}
      src={currentImgSrc}
      alt={alt}
      onError={handleError}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
};

const NewsFeeder = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedNews(null);
    };
    if (selectedNews) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedNews]);

  const fetchLatestNews = async () => {
    try {
      let user = JSON.parse(localStorage.getItem('user') || '{}');
      let nationality = user.nationality || "INDIA";
      
      const res = await axios.get(`${API_BASE_URL}/api/news/latest?nationality=${nationality}`);
      if (res.data.success && res.data.data) {
        setNewsList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch news', err);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateObj) => {
    try {
      if (typeof dateObj === 'string') {
        return new Date(dateObj).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } else if (dateObj && (dateObj.year || dateObj.year?.low)) {
        const y = dateObj.year?.low || dateObj.year || 2024;
        const m = dateObj.month?.low || dateObj.month || 1;
        const d = dateObj.day?.low || dateObj.day || 1;
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch(e) {}
    return 'Recent';
  };

  return (
    <DashboardLayout>
      <DashboardHeader
        title="News Feeder"
        subtitle="Latest updates and announcements from UANDWE"
      />
      <DashboardContainer fullWidth>
        <div className="max-w-7xl mx-auto font-['DM_Sans',sans-serif] px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Loading latest news...
            </div>
          ) : newsList.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                <Newspaper size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Updates Yet</h3>
              <p className="text-gray-500 text-lg">Check back later for the latest news and announcements.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsList.map((newsData, index) => (
                <motion.div 
                  key={newsData.id || index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  onClick={() => setSelectedNews(newsData)}
                  className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
                >
                  {/* Card Image */}
                  <div className="w-full h-[240px] bg-gray-100 relative overflow-hidden rounded-t-3xl">
                    {newsData.imageUrl ? (
                      <NewsImage 
                        src={newsData.imageUrl} 
                        alt={newsData.title || 'News Banner'} 
                        className="w-full h-full object-cover object-top transform transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <Newspaper size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-3">
                      <Calendar size={14} />
                      <span>{parseDate(newsData.createdAt)}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {newsData.title}
                    </h2>
                    
                    {newsData.content && (
                      <p className="text-gray-500 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                        {newsData.content}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
                      <span>Read More</span>
                      <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardContainer>

      {/* FULL-SCREEN MODAL */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl relative flex flex-col overflow-hidden z-10"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 z-20 p-2.5 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {/* Hero Image */}
                {selectedNews.imageUrl && (
                  <div className="w-full bg-gray-50 flex justify-center border-b border-gray-100">
                    <NewsImage 
                      src={selectedNews.imageUrl} 
                      alt={selectedNews.title || 'News Hero'} 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                {/* Article Body */}
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 tracking-wide uppercase mb-4">
                    <Calendar size={16} />
                    <span>{parseDate(selectedNews.createdAt)}</span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                    {selectedNews.title}
                  </h1>

                  {selectedNews.content && (
                    <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap mb-10">
                      {selectedNews.content}
                    </div>
                  )}

                  {selectedNews.linkUrl && (
                    <div className="pt-8 border-t border-gray-100 flex justify-center">
                      <a 
                        href={selectedNews.linkUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Open Linked Resource <ExternalLink size={20} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default NewsFeeder;
