import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';

export default function Home() {
  const [, navigate] = useLocation();

  const handleStartSearch = () => {
    // Clear all previous search-related session storage items
    sessionStorage.removeItem('searchQuery');
    sessionStorage.removeItem('searchResults');
    sessionStorage.removeItem('chatMessages');
    sessionStorage.removeItem('chatStep');
    sessionStorage.removeItem('chatDestination');
    sessionStorage.removeItem('chatDates');
    
    // Navigate to results page
    navigate('/results');
  }

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />

      <main className="flex-grow overflow-hidden relative">
        <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">
              Find Your Perfect Hotel with AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Use our advanced AI assistant to find the ideal hotel that matches all your requirements perfectly.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <button
              onClick={handleStartSearch}
              className="w-full max-w-lg mx-auto flex items-center justify-center bg-primary hover:bg-primary/90 text-white py-5 px-8 rounded-xl shadow-lg transition-all duration-300 font-medium text-lg"
            >
              <i className="fas fa-search mr-3"></i>
              Start Your Hotel Search
            </button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-comments text-xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">Natural Language Search</h3>
                <p className="text-gray-600">Simply describe what you're looking for in plain language.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-map-marker-alt text-xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">Map & List Views</h3>
                <p className="text-gray-600">View results in an interactive map or detailed list format.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-percentage text-xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">Match Percentage</h3>
                <p className="text-gray-600">Hotels ranked by how well they match your specific needs.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
