import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  LogOut,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { AppScriptConfig } from '../types';

interface NavbarProps {
  activeTab: 'student' | 'status' | 'admin';
  setActiveTab: (tab: 'student' | 'status' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onAdminLoginClick: () => void;
  onAdminLogout: () => void;
  appScriptConfig?: AppScriptConfig;
  onOpenAppsScriptModal?: () => void;
  onOpenSyncModal?: () => void;
  pendingMembersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onAdminLoginClick,
  onAdminLogout,
  pendingMembersCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'student' | 'status' | 'admin') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setActiveTab('admin');
    } else {
      onAdminLoginClick();
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onAdminLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabClick('student')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">TemanKelompok</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Akademik
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Platform Rekrutmen & Manajemen Anggota Tugas Kuliah
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => handleTabClick('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Cari Kelompok</span>
              </button>

              <button
                onClick={() => handleTabClick('status')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Cek Pendaftaran</span>
              </button>

              <button
                onClick={handleAdminClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-white/50'
                }`}
                title={isAdminLoggedIn ? 'Dashboard Admin' : 'Buka Akun Admin'}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  {isAdminLoggedIn ? 'Dashboard Admin' : 'Buka Akun Admin'}
                </span>
                {pendingMembersCount > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse shrink-0">
                    {pendingMembersCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Desktop Admin Logout button if logged in */}
            {isAdminLoggedIn && (
              <button
                onClick={handleLogoutClick}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                title="Keluar dari Akun Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={isMobileMenuOpen}
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all focus:outline-hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}

              {/* Notification dot on mobile hamburger icon if pending requests */}
              {!isMobileMenuOpen && pendingMembersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1.5 max-w-md mx-auto">
            {/* Cari Kelompok */}
            <button
              onClick={() => handleTabClick('student')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === 'student'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <span>Cari Kelompok Kuliah</span>
              </div>
              {activeTab === 'student' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Aktif
                </span>
              )}
            </button>

            {/* Cek Pendaftaran */}
            <button
              onClick={() => handleTabClick('status')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === 'status'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Search className="w-4 h-4" />
                </div>
                <span>Cek Status Pendaftaran</span>
              </div>
              {activeTab === 'status' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Aktif
                </span>
              )}
            </button>

            {/* Admin Dashboard / Login */}
            <button
              onClick={handleAdminClick}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === 'admin'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div>{isAdminLoggedIn ? 'Dashboard Admin' : 'Buka Akun Admin'}</div>
                  <div
                    className={`text-[11px] font-normal ${
                      activeTab === 'admin' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {isAdminLoggedIn ? 'Kelola kelompok & pendaftar' : 'Masuk menggunakan PIN Admin'}
                  </div>
                </div>
              </div>

              {pendingMembersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold animate-pulse">
                  {pendingMembersCount} Pendaftar
                </span>
              )}
            </button>

            {/* Admin Logout button in mobile menu if logged in */}
            {isAdminLoggedIn && (
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Keluar dari Akun Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

