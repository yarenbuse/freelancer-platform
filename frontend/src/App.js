import React, { useState, useCallback } from 'react';
import Dashboard from './Dashboard';
import axios from 'axios';

const API = 'http://localhost:8080';

function App() {
  const [user, setUser]             = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab]       = useState('login');
  const [isJobOpen, setIsJobOpen]   = useState(false);

  // ── İlan state'leri ──────────────────────────────────────────────────────
  const [myJobs,   setMyJobs]   = useState([]);   // CLIENT'ın ilanları
  const [openJobs, setOpenJobs] = useState([]);   // Tüm açık ilanlar (Freelancer görünümü)
  const [jobsLoading, setJobsLoading] = useState(false);

  // ── Form state'leri ──────────────────────────────────────────────────────
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData,   setRegData]   = useState({ name: '', email: '', password: '', role: 'FREELANCER' });
  const [jobData,   setJobData]   = useState({ title: '', description: '', budget: '', duration: '' });

  const [authError, setAuthError] = useState('');
  const [jobError,  setJobError]  = useState('');

  // ── Rol etiketi ──────────────────────────────────────────────────────────
  const roleLabel = (role) => {
    if (role === 'CLIENT')     return 'Müşteri';
    if (role === 'FREELANCER') return 'Freelancer';
    if (role === 'ADMIN')      return 'Admin';
    return role;
  };

  // ── API: Açık tüm ilanları çek (Freelancer için) ─────────────────────────
  const fetchOpenJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/jobs`);
      setOpenJobs(res.data);
    } catch (err) {
      console.error('Açık ilanlar alınamadı:', err.message);
    }
  }, []);

  // ── API: Kullanıcının kendi ilanlarını çek (Client için) ──────────────────
  const fetchMyJobs = useCallback(async (userId) => {
    if (!userId) return;
    setJobsLoading(true);
    try {
      const res = await axios.get(`${API}/api/jobs/employer/${userId}`);
      setMyJobs(res.data);
    } catch (err) {
      console.error('Kendi ilanlarım alınamadı:', err.message);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  // ── Giriş Yap ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API}/api/users/login`, loginData);
      const loggedUser = { id: res.data.id, name: res.data.name, role: res.data.role };
      setUser(loggedUser);
      setIsAuthOpen(false);
      setLoginData({ email: '', password: '' });
      // Giriş sonrası ilgili ilanları çek
      if (loggedUser.role === 'CLIENT') {
        fetchMyJobs(loggedUser.id);
      } else {
        fetchOpenJobs();
      }
    } catch (err) {
      const msg = err.response?.status === 401
        ? 'E-posta veya şifre hatalı.'
        : 'Giriş yapılırken bir hata oluştu.';
      setAuthError(msg);
    }
  };

  // ── Kayıt Ol ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API}/api/users/register`, regData);
      const newUser = { id: res.data.id, name: res.data.name, role: res.data.role };
      setUser(newUser);
      setIsAuthOpen(false);
      setRegData({ name: '', email: '', password: '', role: 'FREELANCER' });
      // Kayıt sonrası ilgili ilanları çek
      if (newUser.role === 'CLIENT') {
        fetchMyJobs(newUser.id);
      } else {
        fetchOpenJobs();
      }
    } catch (err) {
      const msg = err.response?.status === 409
        ? 'Bu e-posta adresi zaten kayıtlı.'
        : 'Kayıt sırasında bir hata oluştu.';
      setAuthError(msg);
    }
  };

  // ── İş İlanı Ver ─────────────────────────────────────────────────────────
  const handlePostJob = async (e) => {
    e.preventDefault();
    setJobError('');
    try {
      await axios.post(`${API}/api/jobs`, {
        employerId:  user.id,
        title:       jobData.title,
        description: jobData.description,
        budget:      parseFloat(jobData.budget),
        duration:    parseInt(jobData.duration, 10),
      });
      // İlan kaydedildikten sonra listeyi yenile
      await fetchMyJobs(user.id);
      setIsJobOpen(false);
      setJobData({ title: '', description: '', budget: '', duration: '' });
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data || null;
      setJobError(serverMsg || 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('İlan hatası:', err.response?.data || err.message);
    }
  };

  // ── Ortak input stili ────────────────────────────────────────────────────
  const inputCls = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="App">
      <Dashboard
        user={user}
        roleLabel={roleLabel}
        myJobs={myJobs}
        openJobs={openJobs}
        jobsLoading={jobsLoading}
        onAuthClick={() => { setAuthTab('login'); setIsAuthOpen(true); }}
        onPostJobClick={() => setIsJobOpen(true)}
      />

      {/* ════════════ GİRİŞ / KAYIT MODALI ════════════ */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">

            <button
              onClick={() => { setIsAuthOpen(false); setAuthError(''); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-orange-500 transition-colors text-2xl font-bold"
            >&times;</button>

            <div className="flex mb-8 bg-gray-100 rounded-2xl p-1">
              {['login', 'register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setAuthTab(tab); setAuthError(''); }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    authTab === tab
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'text-gray-500 hover:text-orange-500'
                  }`}
                >
                  {tab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </button>
              ))}
            </div>

            {/* ── Giriş Formu ── */}
            {authTab === 'login' && (
              <>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Tekrar hoş geldiniz!</h2>
                <p className="text-gray-500 text-sm mb-6">Hesabınıza giriş yapın ve çalışmaya başlayın.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
                    <input type="email" required placeholder="ornek@mail.com" className={inputCls}
                      value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Şifre</label>
                    <input type="password" required placeholder="••••••••" className={inputCls}
                      value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
                  </div>
                  {authError && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">{authError}</p>}
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5">
                    Giriş Yap
                  </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-5">
                  Hesabınız yok mu?{' '}
                  <button onClick={() => setAuthTab('register')} className="text-orange-500 font-bold hover:underline">Kayıt olun</button>
                </p>
              </>
            )}

            {/* ── Kayıt Formu ── */}
            {authTab === 'register' && (
              <>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Hemen Katılın!</h2>
                <p className="text-gray-500 text-sm mb-6">Hayalinizdeki projeye bir adım kaldı.</p>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad</label>
                    <input type="text" required placeholder="Örn: Ahmet Yılmaz" className={inputCls}
                      value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
                    <input type="email" required placeholder="ornek@mail.com" className={inputCls}
                      value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Şifre</label>
                    <input type="password" required placeholder="••••••••" className={inputCls}
                      value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Platformdaki Rolünüz</label>
                    <select className={inputCls} value={regData.role}
                      onChange={e => setRegData({ ...regData, role: e.target.value })}>
                      <option value="FREELANCER">Freelancer (İş Arıyorum)</option>
                      <option value="CLIENT">Müşteri (İş Veriyorum)</option>
                    </select>
                  </div>
                  {authError && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">{authError}</p>}
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5">
                    Kayıt Ol ve Başla
                  </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-5">
                  Zaten hesabınız var mı?{' '}
                  <button onClick={() => setAuthTab('login')} className="text-orange-500 font-bold hover:underline">Giriş yapın</button>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════ İŞ İLANI MODALI ════════════ */}
      {isJobOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
            <button
              onClick={() => { setIsJobOpen(false); setJobError(''); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-orange-500 transition-colors text-2xl font-bold"
            >&times;</button>

            <h2 className="text-2xl font-extrabold text-orange-500 mb-1">Yeni İş İlanı</h2>
            <p className="text-gray-500 text-sm mb-6">İlanınızı yayınlayın, en iyi freelancer'ı bulun.</p>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Başlık</label>
                <input type="text" required placeholder="Örn: React Geliştirici Aranıyor" className={inputCls}
                  value={jobData.title} onChange={e => setJobData({ ...jobData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Açıklama</label>
                <textarea required placeholder="Proje detaylarını ve gereksinimlerini yazın..." rows={4}
                  className={inputCls + " resize-none"} value={jobData.description}
                  onChange={e => setJobData({ ...jobData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bütçe (TL)</label>
                  <input type="number" required placeholder="5000" min="1" className={inputCls}
                    value={jobData.budget} onChange={e => setJobData({ ...jobData, budget: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Süre (Gün)</label>
                  <input type="number" required placeholder="30" min="1" className={inputCls}
                    value={jobData.duration} onChange={e => setJobData({ ...jobData, duration: e.target.value })} />
                </div>
              </div>
              {jobError && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">{jobError}</p>
              )}
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5">
                İlanı Yayınla
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;