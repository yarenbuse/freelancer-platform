import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080';

const ReviewModal = ({ isOpen, onClose, job, user, onSuccess }) => {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job || !user) return null;

  // Reviewee is the other party. If user is CLIENT, reviewee is the Freelancer who won the bid.
  // If user is FREELANCER, reviewee is the employer.
  let targetUserId = null;
  if (user.role === 'CLIENT') {
    // Find accepted bid to get freelancer
    const acceptedBid = job.bids?.find(b => b.status === 'ACCEPTED');
    targetUserId = acceptedBid?.freelancer?.id;
  } else {
    targetUserId = job.employer?.id;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUserId) {
      setError('Değerlendirilecek kullanıcı bulunamadı.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/api/reviews`, {
        jobId: job.id,
        reviewerId: user.id,
        targetUserId: targetUserId,
        score: Number(score),
        comment: comment
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Değerlendirme gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-orange-500 transition-colors text-2xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-extrabold text-orange-500 mb-2">Değerlendirme Yap</h2>
        <p className="text-gray-500 text-sm mb-6">
          Bu iş tamamlandı! Lütfen çalışma deneyiminizi puanlayın.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Puan (1-5)</label>
            <select 
              value={score} 
              onChange={(e) => setScore(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num} Yıldız</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Yorumunuz</label>
            <textarea 
              rows="4"
              required
              placeholder="Çalışma deneyiminizi anlatın..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
