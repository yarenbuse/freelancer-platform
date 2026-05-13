import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import JobCard from './components/JobCard';
import ReviewModal from './components/ReviewModal';

const API = 'http://localhost:8080';

const Dashboard = ({
  user,
  roleLabel,
  myJobs,
  openJobs,
  freelancerJobs,
  jobsLoading,
  onAuthClick,
  onPostJobClick,
}) => {
  const [expandedJobId, setExpandedJobId] = useState(null);
  
  // Anlık durum güncellemeleri için yerel state yönetimi
  const [localJobStatuses, setLocalJobStatuses] = useState({});
  const [loadingActionJobId, setLoadingActionJobId] = useState(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [jobToReview, setJobToReview] = useState(null);

  // Freelancer Sekme Yönetimi: 'my-works' (Aktif İşlerim) | 'browse' (Tüm İlanlar)
  const [freelancerTab, setFreelancerTab] = useState('my-works');

  // Teslimat (Delivery) Modal State
  const [deliveryModalJob, setDeliveryModalJob] = useState(null);
  const [deliveryFile, setDeliveryFile] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isDelivering, setIsDelivering] = useState(false);

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
      alert(`Teklif başarıyla ${status === 'ACCEPTED' ? 'onaylandı' : 'reddedildi'}.`);
      window.location.reload();
    } catch (err) {
      console.error('Bid update error:', err);
      alert('İşlem sırasında bir hata oluştu.');
    }
  };

  // ── ESCROW ACTIONS ──
  const handleJobAction = async (jobId, actionPath, confirmMessage) => {
    // Özel ödeme akışı (pay)
    if (actionPath === 'pay') {
      const result = await Swal.fire({
        title: 'Ödeme Emanete Alınacak',
        text: 'Proje tutarını güvenli havuza (Escrow) aktarmak istediğinize emin misiniz?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Evet, Ödeme Yap',
        cancelButtonText: 'İptal',
        customClass: {
          popup: 'rounded-3xl shadow-2xl border border-orange-100',
          confirmButton: 'font-bold px-6 py-3 rounded-xl',
          cancelButton: 'font-bold px-6 py-3 rounded-xl'
        }
      });
      if (!result.isConfirmed) return;

      setLoadingActionJobId(jobId);
      try {
        // Sunumda animasyonun daha net görülmesi için kısa bir yapay gecikme (800ms)
        const postPromise = axios.post(`${API}/api/jobs/${jobId}/pay`);
        const delayPromise = new Promise(resolve => setTimeout(resolve, 800));
        await Promise.all([postPromise, delayPromise]);

        // Anlık UI güncellemesi için yerel durumu ayarla (Sayfa yenilenmeden badge ve buton değişir)
        setLocalJobStatuses(prev => ({ ...prev, [jobId]: 'PAYMENT_HELD' }));

        await Swal.fire({
          icon: 'success',
          title: 'İşlem Başarılı!',
          text: 'Ödeme başarıyla emanet havuzuna (Escrow) alındı. Freelancer işi teslim ettiğinde onaylayabilirsiniz.',
          confirmButtonColor: '#f97316',
          customClass: {
            popup: 'rounded-3xl shadow-2xl border border-orange-100',
            confirmButton: 'font-bold px-6 py-3 rounded-xl'
          }
        });
      } catch (err) {
        console.error('Payment error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Hata',
          text: 'İşlem sırasında bir hata oluştu: ' + (err.response?.data?.message || err.message),
          confirmButtonColor: '#f97316',
          customClass: {
            popup: 'rounded-3xl shadow-2xl',
            confirmButton: 'font-bold px-6 py-3 rounded-xl'
          }
        });
      } finally {
        setLoadingActionJobId(null);
      }
      return;
    }

    // Diğer aksiyonlar
    if (confirmMessage) {
      const result = await Swal.fire({
        title: 'Onay',
        text: confirmMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Evet, Onayla',
        cancelButtonText: 'İptal',
        customClass: {
          popup: 'rounded-3xl shadow-2xl',
          confirmButton: 'font-bold px-6 py-3 rounded-xl',
          cancelButton: 'font-bold px-6 py-3 rounded-xl'
        }
      });
      if (!result.isConfirmed) return;
    }

    setLoadingActionJobId(jobId);
    try {
      await axios.post(`${API}/api/jobs/${jobId}/${actionPath}`);
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'İşlem başarıyla gerçekleştirildi.',
        confirmButtonColor: '#f97316',
        customClass: {
          popup: 'rounded-3xl shadow-2xl',
          confirmButton: 'font-bold px-6 py-3 rounded-xl'
        }
      });
      window.location.reload();
    } catch (err) {
      console.error('Job action error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'İşlem sırasında bir hata oluştu: ' + (err.response?.data?.message || err.message),
        confirmButtonColor: '#f97316',
        customClass: {
          popup: 'rounded-3xl shadow-2xl',
          confirmButton: 'font-bold px-6 py-3 rounded-xl'
        }
      });
    } finally {
      setLoadingActionJobId(null);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!deliveryModalJob) return;

    setIsDelivering(true);
    const formData = new FormData();
    if (deliveryFile) {
      formData.append('file', deliveryFile);
    }
    formData.append('note', deliveryNote);

    try {
      await axios.post(`${API}/api/jobs/${deliveryModalJob.id}/deliver-with-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Anlık UI güncellemesi
      setLocalJobStatuses(prev => ({ ...prev, [deliveryModalJob.id]: 'DELIVERED' }));

      await Swal.fire({
        icon: 'success',
        title: 'Teslimat Başarılı!',
        text: 'İş başarıyla teslim edildi. Müşteri onayı bekleniyor.',
        confirmButtonColor: '#f97316',
        customClass: {
          popup: 'rounded-3xl shadow-2xl border border-orange-100',
          confirmButton: 'font-bold px-6 py-3 rounded-xl'
        }
      });

      setDeliveryModalJob(null);
      setDeliveryFile(null);
      setDeliveryNote('');
    } catch (err) {
      console.error('Delivery error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Teslimat sırasında bir hata oluştu: ' + (err.response?.data?.message || err.message),
        confirmButtonColor: '#f97316',
        customClass: {
          popup: 'rounded-3xl shadow-2xl',
          confirmButton: 'font-bold px-6 py-3 rounded-xl'
        }
      });
    } finally {
      setIsDelivering(false);
    }
  };

  const renderStars = (rating) => {
    if (rating == null || rating === 0) return <span className="text-gray-400 text-xs">Henüz puanı yok</span>;
    return <span className="text-orange-500 font-bold text-sm">⭐ {rating.toFixed(1)}</span>;
  };

  const openReviewModal = (job) => {
    setJobToReview(job);
    setIsReviewModalOpen(true);
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
                    // Anlık güncelleme için yerel durum (local override) kontrolü
                    const currentStatus = localJobStatuses[job.id] || job.status;
                    const isActionLoading = loadingActionJobId === job.id;

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
                                currentStatus === 'OPEN' ? 'bg-gray-100 text-gray-700' : 
                                currentStatus === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                                currentStatus === 'PAYMENT_HELD' ? 'bg-yellow-100 text-yellow-700' :
                                currentStatus === 'DELIVERED' ? 'bg-purple-100 text-purple-700' :
                                currentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                currentStatus === 'DISPUTED' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {currentStatus === 'PAYMENT_HELD' ? 'PAYMENT_HELD (Emanette)' : currentStatus}
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
                              <span>Detaylar & Teklifler</span>
                              <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        </div>

                        {/* Detaylar Alt Menüsü */}
                        {isExpanded && (
                          <div className="bg-gray-50 p-6">
                            
                            {/* Escrow Actions */}
                            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-orange-100">
                              <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">İşlem Durumu & Aksiyonlar</h5>
                              <div className="flex flex-wrap items-center gap-3">
                                {currentStatus === 'IN_PROGRESS' && (
                                  <button 
                                    onClick={() => handleJobAction(job.id, 'pay', null)} 
                                    disabled={isActionLoading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center space-x-2 shadow-md shadow-blue-100 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                                  >
                                    {isActionLoading ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                        <span>İşleniyor...</span>
                                      </>
                                    ) : (
                                      <span>Ödeme Yap (Emanete Al)</span>
                                    )}
                                  </button>
                                )}
                                {currentStatus === 'PAYMENT_HELD' && (
                                  <button 
                                    disabled 
                                    className="bg-gray-200 text-gray-500 font-bold py-2.5 px-5 rounded-xl text-sm cursor-not-allowed border border-gray-300 flex items-center space-x-2"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                    <span>Ödeme Emanette</span>
                                  </button>
                                )}
                                {currentStatus === 'DELIVERED' && (
                                  <>
                                    <button 
                                      onClick={() => handleJobAction(job.id, 'approve', 'İşi onaylıyor musunuz? Ücret Freelancer\'a aktarılacaktır.')} 
                                      disabled={isActionLoading}
                                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all flex items-center space-x-2 disabled:opacity-60"
                                    >
                                      {isActionLoading ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          <span>İşleniyor...</span>
                                        </>
                                      ) : (
                                        <span>Teslimatı Onayla</span>
                                      )}
                                    </button>
                                    <button 
                                      onClick={() => handleJobAction(job.id, 'dispute', 'Anlaşmazlık başlatmak istediğinize emin misiniz?')} 
                                      disabled={isActionLoading}
                                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all flex items-center space-x-2 disabled:opacity-60"
                                    >
                                      Anlaşmazlık Bildir (Dispute)
                                    </button>
                                  </>
                                )}
                                {currentStatus === 'COMPLETED' && (
                                  <button onClick={() => openReviewModal(job)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all">
                                    Freelancer'ı Değerlendir
                                  </button>
                                )}
                                {['OPEN', 'DISPUTED'].includes(currentStatus) && (
                                  <span className="text-gray-500 text-sm">Şu an sizin yapabileceğiniz bir aksiyon bulunmuyor.</span>
                                )}
                              </div>
                            </div>

                            <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">Teklifler</h5>
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

        {/* ── FREELANCER Görünümü ── */}
        {user && user.role === 'FREELANCER' && (
          <div className="mb-12">
            {/* Sekme Butonları */}
            <div className="flex border-b border-gray-200 mb-8 space-x-8">
              <button
                onClick={() => setFreelancerTab('my-works')}
                className={`pb-4 font-bold text-lg transition-all relative ${
                  freelancerTab === 'my-works'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                İşlerim (Aktif Projeler)
                {freelancerJobs?.filter(j => (localJobStatuses[j.id] || j.status) === 'PAYMENT_HELD').length > 0 && (
                  <span className="absolute -top-1 -right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>
              <button
                onClick={() => setFreelancerTab('browse')}
                className={`pb-4 font-bold text-lg transition-all ${
                  freelancerTab === 'browse'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Tüm İlanları İncele
              </button>
            </div>

            {freelancerTab === 'my-works' ? (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Üzerimdeki İşler ve Emanet Durumları</h3>
                <p className="text-gray-500 text-sm mb-6">Müşterinin ödemesini emanet havuzuna aktardığı işleri buradan teslim edebilir, tamamlanan işleri değerlendirebilirsiniz.</p>
                
                {!freelancerJobs || freelancerJobs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
                    Henüz üzerinize tanımlanmış veya kabul edilmiş bir iş bulunmuyor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {freelancerJobs.map(job => {
                      const currentStatus = localJobStatuses[job.id] || job.status;
                      return (
                        <div key={job.id} className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                              <h4 className="font-bold text-gray-800 text-xl mb-1">{job.title}</h4>
                              <p className="text-gray-500 text-sm font-medium">Müşteri: <span className="text-gray-700">{job.employer?.name}</span></p>
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                              {job.budget && (
                                <span className="bg-orange-50 text-orange-600 font-extrabold px-3 py-1 rounded-xl border border-orange-100 text-sm">
                                  💰 {job.budget.toLocaleString('tr-TR')} TL
                                </span>
                              )}
                              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                                currentStatus === 'PAYMENT_HELD' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                currentStatus === 'DELIVERED' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                currentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {currentStatus === 'PAYMENT_HELD' ? 'Ödeme Emanette' : currentStatus === 'DELIVERED' ? 'Onay Bekliyor' : currentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="text-xs text-gray-400">
                              {currentStatus === 'PAYMENT_HELD' && 'İşi tamamladığınızda teslimat dosyası ve notunuzu ekleyerek müşteriye iletebilirsiniz.'}
                              {currentStatus === 'DELIVERED' && 'Teslimat dosyası müşteriye iletildi. Müşteri onayı bekleniyor.'}
                              {currentStatus === 'COMPLETED' && 'Bu proje başarıyla tamamlandı.'}
                            </div>
                            <div className="flex gap-3">
                              {currentStatus === 'PAYMENT_HELD' && (
                                <button 
                                  onClick={() => setDeliveryModalJob(job)} 
                                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md shadow-orange-100 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2"
                                >
                                  <span>🚀 İşi Teslim Et</span>
                                </button>
                              )}
                              {currentStatus === 'DELIVERED' && (
                                <button 
                                  disabled 
                                  className="bg-gray-100 text-gray-400 font-bold py-2.5 px-6 rounded-xl text-sm cursor-not-allowed border border-gray-200 flex items-center space-x-2"
                                >
                                  <span>✓ Teslim Edildi</span>
                                </button>
                              )}
                              {currentStatus === 'COMPLETED' && (
                                <button 
                                  onClick={() => openReviewModal(job)} 
                                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                                >
                                  Müşteriyi Değerlendir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Tüm İlanlar (Browse) Sekmesi */
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
                    <h3 className="text-2xl font-bold text-gray-800">Size Uygun İşler</h3>
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
        )}

        {/* ── MİSAFİR Görünümü (Tüm İlanlar) ── */}
        {!user && (
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
                <h3 className="text-2xl font-bold text-gray-800">Güncel İş İlanları</h3>
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

      {/* ── İŞ TESLİMAT MODALI ── */}
      {deliveryModalJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-orange-100 transform transition-all">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-800">Proje Teslimatı</h3>
                <p className="text-xs text-orange-600 font-semibold mt-1">{deliveryModalJob.title}</p>
              </div>
              <button 
                onClick={() => setDeliveryModalJob(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliverySubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Teslimat Dosyası <span className="text-gray-400 font-normal">(İsteğe bağlı)</span>
                </label>
                <div className="border-2 border-dashed border-orange-200 rounded-2xl p-6 text-center hover:border-orange-400 transition-colors bg-orange-50/30">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={(e) => setDeliveryFile(e.target.files[0])}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <span className="text-3xl block mb-2">📁</span>
                    <span className="font-bold text-orange-600 text-sm block hover:underline line-clamp-1">
                      {deliveryFile ? deliveryFile.name : 'Dosya Seçin veya Sürükleyin'}
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">Zip, Rar, PDF veya Kaynak Kod</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Teslimat Notu <span className="text-red-500">*</span>
                </label>
                <textarea 
                  required
                  rows="4" 
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Müşteriye iletmek istediğiniz detayları, canlı linkleri veya açıklamaları buraya yazın..."
                  className="w-full rounded-2xl border border-gray-200 p-4 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setDeliveryModalJob(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isDelivering}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-orange-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isDelivering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <span>Teslimatı Tamamla</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        job={jobToReview} 
        user={user}
        onSuccess={() => {
          alert('Değerlendirmeniz başarıyla kaydedildi!');
        }}
      />
    </div>
  );
};

export default Dashboard;