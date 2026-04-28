import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080';

const JobCard = ({ job, user, onBidClick }) => {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidData, setBidData] = useState({ amount: '', deliveryTime: '', message: '' });
  const [bidError, setBidError] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBidClick = () => {
    if (!user) {
      alert('Teklif vermek için giriş yapmalısınız.');
      return;
    }
    setIsBidModalOpen(true);
    setBidData({ amount: '', deliveryTime: '', message: '' });
    setBidError('');
  };

  const handlePostBid = async (e) => {
    e.preventDefault();
    setBidError('');
    setSubmittingBid(true);
    try {
      await axios.post(`${API}/api/bids`, {
        jobId: job.id,
        freelancerId: user.id,
        amount: parseFloat(bidData.amount),
        deliveryTime: parseInt(bidData.deliveryTime, 10),
        message: bidData.message
      });
      setIsBidModalOpen(false);
      setSuccessMsg('Teklifiniz başarıyla iletildi!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Teklif hatası:', err);
      setBidError(err.response?.data?.error || 'Teklif gönderilirken bir hata oluştu.');
    } finally {
      setSubmittingBid(false);
    }
  };

  const inputCls = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all";

  return (
    <>
      {successMsg && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: '#22c55e', color: '#fff', padding: '0.85rem 1.5rem',
          borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem',
          boxShadow: '0 4px 24px rgba(34,197,94,0.35)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          ✅ {successMsg}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 hover:border-orange-300 hover:shadow-xl transition-all group relative">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
            {job.title}
          </h4>
          <div className="text-right shrink-0 ml-4">
            <div className="text-2xl font-black text-orange-500">
              {job.budget?.toLocaleString('tr-TR')} TL
            </div>
            {job.duration && (
              <div className="text-xs text-gray-400 font-medium">{job.duration} gün</div>
            )}
          </div>
        </div>

        <p className="text-gray-500 mb-5 leading-relaxed text-sm line-clamp-3">{job.description}</p>

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {job.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* İş Veren Bilgisi */}
        {job.employer && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">İş Veren: </span>
            <Link to={`/profile/${job.employer.id}`} className="text-sm font-bold text-orange-600 hover:underline">
              {job.employer.name}
            </Link>
          </div>
        )}

        {/* Freelancer için Teklif Ver */}
        {user && user.role === 'FREELANCER' && (
          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <button
              onClick={handleBidClick}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-100 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Teklif Ver</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* TEKLİF VERME MODALI */}
      {isBidModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
            <button
              onClick={() => setIsBidModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-orange-500 transition-colors text-2xl font-bold"
            >&times;</button>

            <h2 className="text-2xl font-extrabold text-orange-500 mb-1">Teklif Ver</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">
              <span className="text-gray-800 font-bold">{job.title}</span> ilanı için teklifinizi oluşturun.
            </p>

            <form onSubmit={handlePostBid} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teklifiniz (TL)</label>
                  <input type="number" required placeholder="Örn: 4000" min="1" className={inputCls}
                    value={bidData.amount} onChange={e => setBidData({ ...bidData, amount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teslim Süresi (Gün)</label>
                  <input type="number" required placeholder="Örn: 15" min="1" className={inputCls}
                    value={bidData.deliveryTime} onChange={e => setBidData({ ...bidData, deliveryTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mesajınız (Freelancer Notu)</label>
                <textarea required placeholder="Neden sizi seçmeliler? Projeyi nasıl yapmayı planlıyorsunuz?" rows={4}
                  className={inputCls + " resize-none"} value={bidData.message}
                  onChange={e => setBidData({ ...bidData, message: e.target.value })} />
              </div>
              {bidError && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">{bidError}</p>
              )}
              <button 
                type="submit" 
                disabled={submittingBid}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submittingBid ? 'Gönderiliyor...' : 'Teklifi Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard;
