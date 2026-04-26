import React from 'react';

const Dashboard = ({
  user,
  roleLabel,
  myJobs,
  openJobs,
  jobsLoading,
  onAuthClick,
  onPostJobClick,
}) => {

  // Freelancer görünümü için: eğer API henüz veri dönmediyse örnek kartlar göster
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
    {
      id: 's3',
      title: "UI/UX Tasarım Uzmanı",
      budget: 4200,
      duration: 20,
      tags: ["Figma", "Mobil Tasarım", "Prototipleme"],
      description: "Mobil uygulamamız için kullanıcı dostu, modern ve erişilebilir bir tasarım sistemi oluşturmanıza ihtiyaç duyuyoruz.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ════════════ NAVBAR ════════════ */}
      <nav className="bg-white shadow-md p-4 sticky top-0 z-40 border-b border-orange-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Freelance <span className="text-orange-500">Platformu</span>
            </h1>
          </div>

          {/* Sağ Alan */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-gray-600 font-medium hover:text-orange-500 cursor-pointer transition-colors">
              İş İlanlarını Keşfet
            </span>

            {/* CLIENT → İş İlanı Ver butonu */}
            {user && user.role === 'CLIENT' && (
              <button
                onClick={onPostJobClick}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <span className="text-lg leading-none">+</span>
                <span>İş İlanı Ver</span>
              </button>
            )}

            {/* Kullanıcı bilgisi ya da giriş butonu */}
            {user ? (
              <div className="flex items-center space-x-3 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-200">
                <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-orange-800 text-sm">Merhaba, {user.name}</span>
                  <span className="text-xs text-orange-500 font-medium">({roleLabel(user.role)})</span>
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-orange-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                Giriş Yap / Kayıt Ol
              </button>
            )}
          </div>
        </div>
      </nav>

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
                  ? 'İş ilanlarınızı yönetin ve en iyi freelancer\'ları bulun.'
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
            {/* Verdiğim İlanlar */}
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
                  <p className="text-gray-500 mb-6">İlk iş ilanınızı vererek yetenekli freelancer'ları keşfedin.</p>
                  <button
                    onClick={onPostJobClick}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-200 transition-all"
                  >
                    + İlk İlanımı Ver
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {myJobs.map(job => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 text-lg leading-snug">{job.title}</h4>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ml-2 ${
                          job.status === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {job.status === 'OPEN' ? 'Aktif' : job.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">{job.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 pt-3 border-t border-gray-50">
                        <span className="font-semibold text-orange-600">
                          💰 {job.budget?.toLocaleString('tr-TR')} TL
                        </span>
                        <span>⏱ {job.duration} gün</span>
                      </div>
                    </div>
                  ))}
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
                  <div
                    key={job.id}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 hover:border-orange-300 hover:shadow-xl transition-all cursor-pointer group"
                  >
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

                    <p className="text-gray-500 mb-5 leading-relaxed text-sm">{job.description}</p>

                    {/* Etiketler — API verisinde tags yoksa gösterme */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {job.tags.map(tag => (
                          <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Freelancer için Teklif Ver */}
                    {user && user.role === 'FREELANCER' && (
                      <div className="pt-4 border-t border-gray-50 flex justify-end">
                        <button
                          onClick={() => alert('Teklif verme özelliği yakında açılacak!')}
                          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-100 transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                          <span>Teklif Ver</span>
                          <span>→</span>
                        </button>
                      </div>
                    )}
                  </div>
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