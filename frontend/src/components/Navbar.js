import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, roleLabel, onAuthClick, onPostJobClick, handleLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const onLogout = () => {
    setIsDropdownOpen(false);
    handleLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-40 border-b border-orange-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black text-xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Freelance <span className="text-orange-500">Platformu</span>
          </h1>
        </Link>

        {/* Sağ Alan */}
        <div className="flex items-center space-x-4">
          <Link to="/discover" className="hidden md:block text-gray-600 font-medium hover:text-orange-500 cursor-pointer transition-colors">
            İlanları Keşfet
          </Link>

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
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight text-left">
                  <span className="font-bold text-orange-800 text-sm">Merhaba, {user.name}</span>
                  <span className="text-xs text-orange-500 font-medium">({roleLabel(user.role)})</span>
                </div>
                <svg className={`w-4 h-4 text-orange-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {/* Açılır Menü */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
                  >
                    Profili Gör
                  </Link>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
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
  );
};

export default Navbar;
