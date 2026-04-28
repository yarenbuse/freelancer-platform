import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080';

const Profile = ({ roleLabel, user }) => {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit states for About Me
  const [isEditing, setIsEditing] = useState(false);
  const [aboutMeInput, setAboutMeInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Rating states
  const [ratingHover, setRatingHover] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/users/${id}`);
      setProfileUser(res.data);
      setAboutMeInput(res.data.aboutMe || '');
    } catch (err) {
      console.error('Kullanıcı alınamadı:', err);
      setError('Kullanıcı bulunamadı veya bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveAboutMe = async () => {
    setSaving(true);
    try {
      const updatedUser = { ...profileUser, aboutMe: aboutMeInput };
      const res = await axios.put(`${API}/api/users/${id}`, updatedUser);
      setProfileUser(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      alert('Hakkımda güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleRateUser = async (score) => {
    if (!user) {
      alert('Puan vermek için giriş yapmalısınız.');
      return;
    }
    setSubmittingRating(true);
    try {
      await axios.post(`${API}/api/ratings`, {
        score: score,
        voterId: user.id,
        targetUserId: parseInt(id, 10)
      });
      // Puan verildikten sonra kullanıcıyı tekrar çekip ortalamayı güncelliyoruz
      await fetchUser();
    } catch (err) {
      console.error('Puan verme hatası:', err);
      alert('Puan verilirken bir hata oluştu.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-2xl ${i <= Math.round(rating) ? 'text-orange-500' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center flex-col">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-700">{error || 'Kullanıcı bulunamadı.'}</h2>
      </div>
    );
  }

  const isOwnProfile = user && String(user.id) === String(id);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Üst Kısım: Temel Bilgiler */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-32"></div>
          <div className="px-8 pb-8 flex flex-col items-center -mt-16 relative">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl border border-gray-50 mb-4">
              <div className="w-full h-full bg-orange-100 rounded-full flex justify-center items-center text-5xl font-black text-orange-600">
                {profileUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-gray-800">{profileUser.name}</h2>
            <p className="text-orange-500 font-bold mb-3">{roleLabel ? roleLabel(profileUser.role) : profileUser.role}</p>

            {/* Puan Gösterimi */}
            <div className="flex items-center space-x-1 mb-6 bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100">
              {profileUser.rating == null || profileUser.rating === 0 ? (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-2xl tracking-widest">★★★★★</span>
                  <span className="font-medium text-gray-500 text-sm ml-2">Henüz puanlanmadı</span>
                </div>
              ) : (
                <>
                  <div className="flex space-x-1 mr-2">
                    {renderStars(profileUser.rating)}
                  </div>
                  <span className="font-black text-gray-700 text-lg">{(profileUser.rating).toFixed(1)} / 5.0</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3 text-gray-600 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span className="font-medium text-lg">{profileUser.email}</span>
            </div>
          </div>
        </div>

        {/* Puan Verme Modülü (Sadece başkaları için görünür) */}
        {!isOwnProfile && user && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center">
             <h3 className="text-xl font-bold text-gray-800 mb-2">Bu kullanıcıyı değerlendirin</h3>
             <p className="text-gray-500 text-sm mb-4">Deneyiminize göre 1 ile 5 arasında bir puan verin.</p>
             
             <div className="flex space-x-2">
               {[1, 2, 3, 4, 5].map((star) => (
                 <button
                   key={star}
                   disabled={submittingRating}
                   onClick={() => handleRateUser(star)}
                   onMouseEnter={() => setRatingHover(star)}
                   onMouseLeave={() => setRatingHover(0)}
                   className={`text-4xl transition-all transform hover:scale-110 ${
                     star <= ratingHover ? 'text-orange-500' : 'text-gray-200'
                   } disabled:opacity-50`}
                 >
                   ★
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* Alt Kısım: Hakkımda Kartı */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-orange-500">📖</span> Hakkımda
            </h3>
            
            {isOwnProfile && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-orange-600 hover:text-white border border-orange-200 hover:bg-orange-500 hover:border-orange-500 font-bold px-4 py-2 rounded-xl transition-all text-sm"
              >
                Düzenle
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-y min-h-[150px] text-gray-700"
                placeholder="Kendinizden, yeteneklerinizden ve tecrübelerinizden bahsedin..."
                value={aboutMeInput}
                onChange={(e) => setAboutMeInput(e.target.value)}
              />
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setAboutMeInput(profileUser.aboutMe || '');
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSaveAboutMe}
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 leading-relaxed min-h-[100px]">
              {profileUser.aboutMe ? (
                <p className="whitespace-pre-wrap text-lg">{profileUser.aboutMe}</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="font-medium">Bu kullanıcı henüz hakkında bir bilgi eklememiş.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
