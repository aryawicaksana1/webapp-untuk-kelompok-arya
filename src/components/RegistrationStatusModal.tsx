import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  ExternalLink,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { Course, Group, Member } from '../types';
import { formatDateIndo, formatWhatsAppNumber, getWhatsAppChatUrl } from '../utils/formatters';

interface RegistrationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  groups: Group[];
  members: Member[];
}

export const RegistrationStatusModal: React.FC<RegistrationStatusModalProps> = ({
  isOpen,
  onClose,
  courses,
  groups,
  members,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const results = members.filter((m) => {
    if (!searchTerm.trim()) return false;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const cleanWaSearch = formatWhatsAppNumber(searchTerm);
    const memberWaClean = formatWhatsAppNumber(m.whatsapp);

    return (
      m.nim.toLowerCase().includes(cleanSearch) ||
      m.name.toLowerCase().includes(cleanSearch) ||
      (cleanWaSearch && memberWaClean.includes(cleanWaSearch))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cek Status Pendaftaran</h2>
            <p className="text-xs text-slate-500">
              Lacak apakah formulir pengajuan kelompokmu sudah disetujui oleh Admin/Ketua.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Masukkan NIM atau No. WhatsApp kamu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono placeholder:font-sans placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Cari Status
            </button>
          </form>
        </div>

        {/* Results Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {!hasSearched && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ketikkan NIM atau No WhatsApp Anda untuk melihat riwayat pendaftaran.</p>
            </div>
          )}

          {hasSearched && results.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="font-semibold text-slate-700">Data Tidak Ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada pendaftaran dengan NIM / WhatsApp &ldquo;{searchTerm}&rdquo;. Pastikan nomor atau NIM yang Anda masukkan tepat.
              </p>
            </div>
          )}

          {results.map((item) => {
            const group = groups.find((g) => g.id === item.groupId);
            const course = courses.find((c) => c.id === item.courseId);

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {course?.code} - {course?.name}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{group?.name}</h4>
                    <p className="text-xs text-slate-500">Pendaftar: {item.name} ({item.nim})</p>
                  </div>

                  {/* Status Badge */}
                  {item.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Disetujui
                    </span>
                  )}
                  {item.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Menunggu Review
                    </span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 shrink-0">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Ditolak
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Peran Anda:</span>
                    <span className="font-semibold text-slate-700">{item.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Waktu Mendaftar:</span>
                    <span className="text-slate-700">{formatDateIndo(item.registeredAt)}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                    <span className="font-semibold">Catatan Admin: </span>
                    {item.notes}
                  </div>
                )}

                {/* If approved, show WhatsApp group join button! */}
                {item.status === 'APPROVED' && group?.waGroupLink && (
                  <div className="pt-1">
                    <a
                      href={group.waGroupLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Masuk ke Grup WhatsApp Kelompok Sekarang</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                )}

                {/* Contact Ketua Link */}
                {group && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500">Ketua: {group.leaderName}</span>
                    <a
                      href={getWhatsAppChatUrl(
                        group.leaderWa,
                        `Halo ${group.leaderName}, saya ${item.name}. Saya menanyakan pendaftaran saya untuk ${group.name}...`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>Chat Ketua</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
