import React, { useState } from 'react';
import axios from 'axios';
import JobCard from './components/JobCard';

const API = 'http://localhost:8080';

const Dashboard = ({
  user,
  roleLabel,
  myJobs,
  openJobs,
  jobsLoading,
  onAuthClick,
  onPostJobClick,
}) => {
  const [expandedJobId, setExpandedJobId] = useState(null);

  const displayJobs = openJobs.length > 0 ? openJobs : [
    {
      id: 's1',
      title: "Kıdemli React Geliştirici",
      budget: 5000,
      duration: 30,
      tags: ["React", "TailwindCSS", "TypeScript"],
      description: "SaaS ürünümüz için modern bir yönetim paneli geliştirecek, bileşen mimarisine hâkim bir çalışma arkadaşı arıyoruz.",
    },
    {
      id: 's2',
      title: "Node.js & PostgreSQL API Uzmanı",
      budget: 7500,
      duration: 45,
      tags: ["Node.js", "PostgreSQL", "Docker"],
      description: "Mevcut REST API'mizi yeniden yapılandıracak, performans iyileştirmeleri ve yeni endpoint'ler ekleyecek bir geliştirici arıyoruz.",
    },
  ];

  const toggleBids = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };

  const handleUpdateBidStatus = async (bidId, status) => {
    if (status === 'ACCEPTED') {
      const confirmAccept = window.confirm("Bu teklifi onaylamak istediğinize emin misiniz? İlanınız 'Devam Ediyor' durumuna geçecektir.");
      if (!confirmAccept) return;
    }

    try {
      await axios.patch(`${API}/api/bids/${bidId}/status`, { status });
      alert(`Teklif başarıyla ${status === 'ACCEPTED' ? 'onaylandı' : 'reddedildi'}. Değişikliklerin yansıması için lütfen sayfayı yenileyin.`);
      // Not: Tam bir UX için `myJobs`'u burada güncelleyen bir callback (örneğin fetchMyJobs) App.js'ten pass edilmeli.
      // Şimdilik işlemi tamamlayıp sayfayı yenilemelerini söylüyoruz ya da window.location.reload() kullanabiliriz.
      window.location.reload();
    } catch (err) {
      console.error('Bid update error:', err);
      alert('İşlem sırasında bir hata oluştu.');
    }
  };

  const renderStars = (rating) => {
    if (rating == null || rating === 0) return <span className="text-gray-400 text-xs">Henüz puanı yok</span>;
    return <span className="text-orange-500 font-bold text-sm">⭐ {rating.toFixed(1)}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ════════════ HERO ════════════ */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10">
          {user ? (
            <>
              <h2 className="text-5xl font-black mb-4 leading-tight">
                Hoş geldiniz,{' '}
                <span className="text-orange-100">{user.name}!</span>
              </h2>
              <p className="text-orange-100 text-lg max-w-2xl mx-auto">
                {user.role === 'CLIENT'
                  ? 'İş ilanlarınızı yönetin ve gelen teklifleri değerlendirin.'
                  : 'Size uygun işleri keşfedin ve teklif vermeye başlayın.'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-5xl font-black mb-4 leading-tight">
                Hayalinizdeki İşi Bulun<br />
                <span className="text-orange-200">veya Uzmanınızı Kiralayın!</span>
              </h2>
              <p className="text-orange-100 text-lg max-w-2xl mx-auto">
                En iyi projeler ve en yetenekli freelancer'lar Türkiye'nin en dinamik platformunda buluşuyor.
              </p>
              <button
                onClick={onAuthClick}
                className="mt-8 bg-white text-orange-500 font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Hemen Başla →
              </button>
            </>
          )}
        </div>
      </div>

      {/* ════════════ ANA İÇERİK ════════════ */}
      <div className="max-w-7xl mx-auto py-12 px-4">

        {/* ── CLIENT Görünümü ── */}
        {user && user.role === 'CLIENT' && (
          <>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-2xl font-bold text-gray-800">Verdiğim İlanlar</h3>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                    {myJobs.length} ilan
                  </span>
                </div>
                <button
                  onClick={onPostJobClick}
                  className="text-orange-500 font-bold text-sm hover:underline"
                >
                  + Yeni İlan Ver
                </button>
              </div>

              {jobsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                  <span className="ml-3 text-gray-500 font-medium">İlanlar yükleniyor...</span>
                </div>
              ) : myJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-orange-200 p-12 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2">Henüz ilanınız yok</h4>
                  <p className="text-gray-500 mb-6">İlk iş ilanınızı vererek teklifleri almaya başlayın.</p>
                  <button
                    onClick={onPostJobClick}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-200 transition-all"
                  >
                    + İlk İlanımı Ver
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {myJobs.map(job => {
                    const bids = job.bids || [];
                    const isExpanded = expandedJobId === job.id;
                    return (
                      <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* İlan Üst Kısmı */}
                        <div 
                          className={`p-6 cursor-pointer hover:bg-orange-50 transition-colors ${isExpanded ? 'bg-orange-50 border-b border-orange-100' : ''}`}
                          onClick={() => toggleBids(job.id)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-gray-800 text-xl">{job.title}</h4>
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 
                                job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {job.status}
                              </span>
                              <span className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-xs">
                                {bids.length} Teklif Alındı
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                            <div className="flex space-x-4">
                              <span className="text-orange-600">💰 {job.budget?.toLocaleString('tr-TR')} TL</span>
                              <span>⏱ {job.duration} gün</span>
                            </div>
                            <div className="text-orange-500 flex items-center space-x-1">
                              <span>Teklifleri Gör</span>
                              <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        </div>

                        {/* Teklifler Alt Menüsü */}
                        {isExpanded && (
                          <div className="bg-gray-50 p-6">
                            {bids.length === 0 ? (
                              <div className="text-center py-6 text-gray-500">
                                Henüz bu ilana teklif gelmedi.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {bids.map(bid => (
                                  <div key={bid.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
                                          {bid.freelancer?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-gray-800">{bid.freelancer?.name}</h5>
                                          {renderStars(bid.freelancer?.rating)}
                                        </div>
                                      </div>
                                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg mt-2 border border-gray-100">
                                        <span className="font-semibold text-gray-700 block mb-1">Freelancer Notu:</span>
                                        "{bid.message}"
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                      <div className="text-right mb-3">
                                        <div className="text-xl font-black text-orange-600">{bid.amount?.toLocaleString('tr-TR')} TL</div>
                                        <div className="text-sm text-gray-500 font-medium">{bid.deliveryTime} Günde Teslim</div>
                                      </div>
                                      
                                      {bid.status === 'PENDING' && job.status === 'OPEN' ? (
                                        <div className="flex space-x-2 w-full md:w-auto">
                                          <button 
                                            onClick={() => handleUpdateBidStatus(bid.id, 'ACCEPTED')}
                                            className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                                          >
                                            Onayla
                                          </button>
                                          <button 
                                            onClick={() => handleUpdateBidStatus(bid.id, 'REJECTED')}
                                            className="flex-1 md:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                                          >
                                            Reddet
                                          </button>
                                        </div>
                                      ) : (
                                        <div className={`font-bold px-4 py-2 rounded-lg text-sm ${
                                          bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                          {bid.status === 'ACCEPTED' ? '✓ Kabul Edildi' : '✕ Reddedildi'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── FREELANCER / Misafir Görünümü ── */}
        {(!user || user.role === 'FREELANCER') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Filtreler */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Filtreler</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                  <span className="text-gray-600 text-sm">Uzaktan Çalışma</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                  <span className="text-gray-600 text-sm">Tam Zamanlı</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                  <span className="text-gray-600 text-sm">Proje Bazlı</span>
                </label>
                <hr className="my-3 border-gray-100" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bütçe Aralığı</p>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                  <span className="text-gray-600 text-sm">0 – 5.000 TL</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                  <span className="text-gray-600 text-sm">5.000 – 15.000 TL</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 w-4 h-4" />
                  <span className="text-gray-600 text-sm">15.000 TL üzeri</span>
                </label>
              </div>
            </div>

            {/* İlan Listesi */}
            <div className="md:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {user ? 'Size Uygun İşler' : 'Güncel İş İlanları'}
                </h3>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                  {displayJobs.length} ilan
                </span>
              </div>

              <div className="space-y-5">
                {displayJobs.map(job => (
                  <JobCard key={job.id} job={job} user={user} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;