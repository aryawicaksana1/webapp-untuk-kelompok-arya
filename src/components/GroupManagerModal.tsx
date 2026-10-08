import React, { useState, useEffect } from 'react';
import {
  X,
  Users2,
  BookOpen,
  Calendar,
  MessageCircle,
  FileText,
  AlertCircle,
  Hash,
  Link as LinkIcon,
  Plus,
  Trash2,
  UserX,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Course, Group, GroupStatus, Member } from '../types';

interface GroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Partial<Group>) => Promise<void> | void;
  courses: Course[];
  initialData?: Group | null;
  defaultAdminName: string;
  defaultAdminWa: string;
  members?: Member[];
  onDeleteMember?: (memberId: string) => void;
  onClearGroupMembers?: (groupId: string) => void;
}

export const GroupManagerModal: React.FC<GroupManagerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
  initialData,
  defaultAdminName,
  defaultAdminWa,
  members = [],
  onDeleteMember,
  onClearGroupMembers,
}) => {
  const isEditing = Boolean(initialData);

  // Initialize state once when the modal mounts
  const [courseId, setCourseId] = useState<string>(() => initialData?.courseId || courses[0]?.id || '');
  const [name, setName] = useState<string>(() => initialData?.name || '');
  const [topic, setTopic] = useState<string>(() => initialData?.topic || '');
  const [description, setDescription] = useState<string>(() => initialData?.description || '');
  const [maxMembers, setMaxMembers] = useState<number>(() => initialData?.maxMembers || 4);
  const [leaderName, setLeaderName] = useState<string>(() => initialData?.leaderName || defaultAdminName || '');
  const [leaderWa, setLeaderWa] = useState<string>(() => initialData?.leaderWa || defaultAdminWa || '');
  const [status, setStatus] = useState<GroupStatus>(() => initialData?.status || 'OPEN');
  const [deadline, setDeadline] = useState<string>(() => initialData?.deadline || '');
  const [skillInput, setSkillInput] = useState<string>('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(() =>
    Array.isArray(initialData?.requiredSkills) && initialData.requiredSkills.length > 0
      ? [...initialData.requiredSkills]
      : ['Frontend', 'Backend', 'Laporan']
  );
  const [waGroupLink, setWaGroupLink] = useState<string>(() => initialData?.waGroupLink || '');
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // If no course was selected initially and courses becomes available, set the first course as default
  useEffect(() => {
    if (!courseId && courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courseId, courses]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      setError('Pilih Mata Kuliah untuk kelompok ini.');
      return;
    }
    if (!name.trim()) {
      setError('Nama kelompok tidak boleh kosong.');
      return;
    }
    if (!topic.trim()) {
      setError('Topik tugas tidak boleh kosong.');
      return;
    }
    const finalMax = Math.max(1, Number(maxMembers) || 4);

    try {
      setIsSaving(true);
      setError('');
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        courseId,
        name: name.trim(),
        topic: topic.trim(),
        description: description.trim(),
        maxMembers: finalMax,
        leaderName: leaderName.trim() || defaultAdminName,
        leaderWa: leaderWa.trim() || defaultAdminWa,
        status,
        deadline,
        requiredSkills,
        waGroupLink: waGroupLink.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Informasi Kelompok' : 'Buat Kelompok Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Tentukan kuota anggota, topik tugas, dan kriteria keahlian yang dibutuhkan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form id="group-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Pilih Mata Kuliah */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Mata Kuliah <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="" disabled>-- Pilih Mata Kuliah --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.lecturer})
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Kelompok */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Kelompok <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kelompok 1 - Presensi Cerdas QR Code"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Topik Tugas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Topik / Judul Tugas Kelompok <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rancang Bangun Sistem Informasi Kasir Minimarket"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* KUOTA ANGGOTA & STATUS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div>
                <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users2 className="w-3.5 h-3.5 text-blue-600" />
                  Kuota Anggota Maksimal <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={maxMembers === 0 ? '' : maxMembers}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setMaxMembers(isNaN(val) ? 0 : val);
                    }}
                    onBlur={() => {
                      if (!maxMembers || maxMembers < 1) setMaxMembers(1);
                    }}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-blue-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-center text-blue-900"
                  />
                  <span className="text-xs text-blue-800 font-medium shrink-0">Orang</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  Anda bebas menentukan batas kuota anggota per kelompok.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Pendaftaran
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GroupStatus)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                >
                  <option value="OPEN">🟢 Terbuka (Pendaftaran Aktif)</option>
                  <option value="FULL">🔴 Penuh (Kapasitas Tercapai)</option>
                  <option value="CLOSED">⚪ Ditutup (Pendaftaran Dihentikan)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Otomatis berubah ke &ldquo;Penuh&rdquo; jika kuota tercapai.
                </p>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Deskripsi & Ketentuan Pengerjaan
              </label>
              <textarea
                rows={2}
                placeholder="Jelaskan ekspektasi kerja kelompok, komitmen waktu, tools yang dipakai..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Deadline & Link WA Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Batas Waktu / Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Link Undangan Grup WhatsApp
                </label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={waGroupLink}
                  onChange={(e) => setWaGroupLink(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Ketua & Kontak WA Ketua */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Ketua Kelompok
                </label>
                <input
                  type="text"
                  placeholder="Nama Ketua"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  No. WA Ketua (Direct Chat)
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={leaderWa}
                  onChange={(e) => setLeaderWa(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Keahlian yang Dicari Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kebutuhan Peran / Keahlian
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ketik peran, misal: Frontend, Figma, Analis..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-rose-600 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* MANAJEMEN ANGGOTA DI KELOMPOK INI (SAAT EDIT) */}
            {isEditing && initialData && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Daftar Anggota Saat Ini (
                        {members.filter((m) => m.groupId === initialData.id).length} Orang)
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Anda dapat mengeluarkan anggota tertentu atau mengosongkan kelompok ini.
                    </p>
                  </div>

                  {members.some((m) => m.groupId === initialData.id) && onClearGroupMembers && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onClearGroupMembers) {
                          onClearGroupMembers(initialData.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors"
                      title="Keluarkan semua anggota pada kelompok ini"
                    >
                      <UserX className="w-3 h-3" />
                      <span>Kosongkan Anggota</span>
                    </button>
                  )}
                </div>

                {members.filter((m) => m.groupId === initialData.id).length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-dashed border-slate-200 text-slate-400 text-xs">
                    Kelompok ini masih kosong (belum ada anggota).
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {members
                      .filter((m) => m.groupId === initialData.id)
                      .map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{m.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">({m.nim})</span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Peran: <span className="font-medium text-slate-700">{m.role}</span>
                                {' • '}
                                {m.status === 'APPROVED' ? (
                                  <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Diterima
                                  </span>
                                ) : m.status === 'PENDING' ? (
                                  <span className="text-amber-600 font-semibold inline-flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" /> Pending
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-semibold inline-flex items-center gap-0.5">
                                    <XCircle className="w-2.5 h-2.5" /> Ditolak
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {onDeleteMember && (
                            <button
                              type="button"
                              onClick={() => onDeleteMember(m.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus / Keluarkan mahasiswa ini dari kelompok"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="group-form"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {isSaving
                ? 'Menyimpan...'
                : isEditing
                ? 'Simpan Perubahan'
                : 'Buat Kelompok'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
