import React from 'react';
import {
  Users,
  ShieldCheck,
  Search,
  MessageCircle,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  ArrowUpRight,
  GraduationCap,
  Sparkles,
  Lock,
} from 'lucide-react';
import { getWhatsAppChatUrl } from '../utils/formatters';

interface FooterProps {
  onNavigateToStudent: () => void;
  onOpenCheckStatus: () => void;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onOpenAppsScriptModal: () => void;
}

const COURSES_LIST = [
  'Bahasa Inggris',
  'Matematika Teknik',
  'Algoritma dan Pemrograman',
  'Komputer dan Masyarakat',
  'Statistika dan Probabilitas',
  'Sistem Digital',
  'Pancasila',
];

export const Footer: React.FC<FooterProps> = ({
  onNavigateToStudent,
  onOpenCheckStatus,
  onOpenAdminLogin,
  isAdminLoggedIn,
  onOpenAppsScriptModal,
}) => {
  const leaderPhone = '+62 813-5374-6248';

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top CTA Banner */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/60 backdrop-blur-xs">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kolaborasi Tugas Akademik Efektif</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Punya Pertanyaan atau Perlu Diskusi Kelompok?
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Hubungi Ketua Kelompok secara langsung untuk mendiskusikan topik tugas, kuota, atau konfirmasi pendaftaran.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <a
                href={getWhatsAppChatUrl(
                  leaderPhone,
                  'Halo Gus Arya, saya ingin bertanya mengenai pembagian kelompok tugas kuliah...'
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Ketua di WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={onOpenCheckStatus}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-600 transition-all w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cek Pendaftaran Saya</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">TemanKelompok</span>
                <span className="block text-[11px] font-medium text-slate-400">Portal Kolaborasi Mahasiswa</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Platform rekrutmen teman sekelompok tugas kuliah terorganisir. Memudahkan pembagian peran yang adil,
              transparansi kuota anggota yang ditentukan oleh ketua, dan koordinasi cepat via WhatsApp.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Semester Ganjil 2026/2027</span>
            </div>
          </div>

          {/* Column 2: 7 Mata Kuliah */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Mata Kuliah Semester Ini</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {COURSES_LIST.map((matkul, idx) => (
                <li key={idx} className="flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                  <span className="group-hover:text-white transition-colors">{matkul}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Etika & Komitmen Kelompok */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>Etika & Tata Tertib Kelompok</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Komitmen menyelesaikan tugas sebelum batas deadline.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Komunikasi aktif & responsif di grup WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pembagian peran yang adil sesuai keterampilan anggota.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Saling menghargai dan mengutamakan kejujuran akademik.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Navigasi Cepat & Akses Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Navigasi & Pengelolaan</span>
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={onNavigateToStudent}
                className="block text-left text-slate-400 hover:text-white transition-colors py-1"
              >
                &rarr; Cari &amp; Daftar Kelompok
              </button>
              <button
                onClick={onOpenCheckStatus}
                className="block text-left text-slate-400 hover:text-white transition-colors py-1"
              >
                &rarr; Cek Status Pendaftaran Saya
              </button>
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors py-1"
              >
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>{isAdminLoggedIn ? 'Buka Dashboard Admin' : 'Login Admin (Atur Kuota)'}</span>
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={onOpenAppsScriptModal}
                  className="block text-left text-indigo-400 hover:text-indigo-300 transition-colors py-1 font-semibold"
                >
                  &rarr; Kode Google Apps Script
                </button>
              )}

              {/* Ketua Contact Card */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="text-[11px] text-slate-400">Kontak Ketua / Admin:</div>
                <div className="text-xs font-bold text-white">Gus Arya Wicaksana</div>
                <div className="text-xs font-mono text-emerald-400">{leaderPhone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-slate-300">TemanKelompok</strong>. Dirancang untuk kolaborasi tugas akademik mahasiswa.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Dibuat dengan Responsif &amp; Mobile-Friendly</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">WhatsApp Integrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
