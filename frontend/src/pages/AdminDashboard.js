import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const API = 'http://localhost:8080';

const AdminDashboard = ({ user, roleLabel }) => {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, jobsRes] = await Promise.all([
        axios.get(`${API}/api/admin/users`),
        axios.get(`${API}/api/admin/jobs`)
      ]);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error('Admin verileri alınamadı:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (jobId, action) => {
    if (!window.confirm(`Bu işlemi (${action === 'cancel' ? 'İptal/İade' : 'Zorla Onayla'}) gerçekleştirmek istediğinize emin misiniz?`)) return;
    try {
      await axios.post(`${API}/api/admin/jobs/${jobId}/${action}`);
      alert('İşlem başarıyla gerçekleştirildi.');
      fetchAdminData();
    } catch (err) {
      console.error('Admin action error:', err);
      alert('İşlem sırasında hata oluştu.');
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-orange-500 animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  const disputedJobs = jobs.filter(j => j.status === 'DISPUTED');

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin <span className="text-orange-500">Paneli</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistemdeki tüm kullanıcıları, ilanları ve anlaşmazlıkları buradan yönetebilirsiniz.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-12">

          {/* Anlaşmazlıktaki İşler (Disputes) */}
          {disputedJobs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-red-600">Anlaşmazlıktaki İşler (Disputes)</h2>
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full animate-pulse">
                  {disputedJobs.length} Bekleyen Anlaşmazlık
                </span>
              </div>
              <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-red-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">Başlık</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">İşveren</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">Bütçe</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">Aksiyonlar</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {disputedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">#{job.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{job.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.employer?.name || 'Bilinmiyor'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{job.budget} TL</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button 
                              onClick={() => handleAdminAction(job.id, 'cancel')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                            >
                              İptal Et (Müşteriye İade)
                            </button>
                            <button 
                              onClick={() => handleAdminAction(job.id, 'force-approve')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                            >
                              Zorla Onayla (Freelancer'a Öde)
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Kullanıcılar Tablosu */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Sistemdeki Kullanıcılar</h2>
              <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Toplam: {users.length}
              </span>
            </div>
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">İsim</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">E-posta</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-orange-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">#{u.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                              u.role === 'CLIENT' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'}`}>
                            {roleLabel ? roleLabel(u.role) : u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* İlanlar Tablosu */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Sistemdeki İlanlar</h2>
              <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Toplam: {jobs.length}
              </span>
            </div>
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Başlık</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">İşveren</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bütçe</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-orange-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">#{job.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{job.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.employer?.name || 'Bilinmiyor'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{job.budget} TL</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${job.status === 'OPEN' ? 'bg-gray-100 text-gray-700' : 
                              job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                              job.status === 'PAYMENT_HELD' ? 'bg-yellow-100 text-yellow-700' :
                              job.status === 'DELIVERED' ? 'bg-purple-100 text-purple-700' :
                              job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              job.status === 'DISPUTED' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-500'}`}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
