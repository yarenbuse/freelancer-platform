import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const API = 'http://localhost:8080';

const Discover = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error('İlanlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Tüm İlanları Keşfet</h2>
        <p className="text-gray-500 mb-8">Platformdaki güncel tüm ilanları inceleyin ve projenize uygun işleri bulun.</p>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h4 className="text-xl font-bold text-gray-700">Şu anda hiç ilan bulunmuyor</h4>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
