import React, { useState } from 'react';
import {
  X,
  User,
  Hash,
  Phone,
  Mail,
  Briefcase,
  Award,
  HeartHandshake,
  CheckCircle,
  AlertCircle,
  Send,
  MessageCircle,
} from 'lucide-react';
import { Course, Group, Member } from '../types';
import { formatWhatsAppNumber, getWhatsAppChatUrl } from '../utils/formatters';

interface JoinGroupModalProps {
  group: Group;
  course?: Course;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: Omit<Member, 'id' | 'status' | 'registeredAt'>) => Promise<boolean>;
}

const PRESET_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'UI/UX Designer',
  'Penyusun Laporan & PPT',
  'Analis Sistem & Flowchart',
  'Riset Materi & Notulen',
  'Serba Bisa / Fleksibel',
];

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  group,
  course,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [commitment, setCommitment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Silakan isi Nama Lengkap Anda.');
      return;
    }
    if (!nim.trim()) {
      setErrorMessage('Silakan isi NIM / NPM Anda.');
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMessage('Silakan isi Nomor WhatsApp aktif Anda.');
      return;
    }
    if (!role.trim()) {
      setErrorMessage('Pilih atau ketik peran yang ingin Anda ambil.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onSubmit({
        groupId: group.id,
        courseId: group.courseId,
        name: name.trim(),
        nim: nim.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        role: role.trim(),
        skills: skills.trim(),
        commitment: commitment.trim(),
      });

      if (ok) {
        setSuccess(true);
      } else {
        setErrorMessage('Gagal menyimpan pendaftaran. Silakan coba lagi.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setNim('');
    setWhatsapp('');
    setEmail('');
    setRole('');
    setSkills('');
    setCommitment('');
    setSuccess(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                {course?.code}
              </span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                {course?.name}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Formulir Gabung Kelompok</h2>
            <p className="text-xs text-slate-600 font-medium">{group.name}</p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pendaftaran Berhasil Dikirim!</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Data pendaftaranmu telah berhasil dikirim. Ketua Kelompok{' '}
                  <span className="font-semibold text-slate-800">({group.leaderName})</span> akan segera meninjau formulirmu.
                </p>
              </div>

              {/* Direct WA notification button to Ketua */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2">
                <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Kabar Cepat ke Ketua Kelompok:</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Kamu bisa langsung mengirim pesan WhatsApp ke {group.leaderName} untuk memberi tahu bahwa kamu baru saja mendaftar.
                </p>
                <a
                  href={getWhatsAppChatUrl(
                    group.leaderWa,
                    `Halo ${group.leaderName}, saya ${name} (NIM: ${nim}). Saya baru saja mendaftar untuk bergabung di ${group.name} untuk matkul ${course?.name} dengan peran "${role}". Mohon ditinjau ya, terima kasih!`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all w-full justify-center shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Pesan WhatsApp ke Ketua Sekarang</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gus Arya Wicaksana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* NIM & WhatsApp Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-blue-600" />
                    NIM / NPM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2210511045"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    No. WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                  {whatsapp && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Format terdeteksi: +{formatWhatsAppNumber(whatsapp)}
                    </span>
                  )}
                </div>
              </div>

              {/* Email (Opsional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Email Kampus (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="nama.mhs@kampus.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Peran / Role yang diinginkan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  Peran / Tanggung Jawab di Kelompok <span className="text-rose-500">*</span>
                </label>

                {/* Preset Role Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_ROLES.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setRole(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        role === preset
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  placeholder="Atau ketik peran kustom Anda..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Keahlian & Tools */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Keahlian & Pengalaman Tools yang Dikuasai
                </label>
                <input
                  type="text"
                  placeholder="Misal: React, Node.js, Git, Canva, Figma, LaTeX"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Komitmen & Alasan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                  Komitmen & Kesiapan Kerja Kelompok
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Siap kerja kelompok online/offline setiap akhir pekan, respon chat WA cepat, siap tanggung jawab selesaikan tugas sebelum batas waktu."
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan & Menyinkronkan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Pendaftaran ke Kelompok</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
