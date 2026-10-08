import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  Clock,
  Sparkles,
  Users2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Tag,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Course, Group, Member } from '../types';
import { formatDateIndo, getGroupStats, getWhatsAppChatUrl } from '../utils/formatters';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface StudentViewProps {
  courses: Course[];
  groups: Group[];
  members: Member[];
  onOpenJoinModal: (group: Group) => void;
  onOpenCheckStatus: () => void;
  onSwitchToAdmin?: () => void;
  isAdminLoggedIn?: boolean;
  onDeleteGroup?: (groupId: string) => void;
  onOpenEditGroup?: (group: Group) => void;
  onOpenCreateGroup?: () => void;
  onRefreshData?: () => void;
  isSyncing?: boolean;
}

export const StudentView: React.FC<StudentViewProps> = ({
  courses,
  groups,
  members,
  onOpenJoinModal,
  onOpenCheckStatus,
  onSwitchToAdmin,
  isAdminLoggedIn = false,
  onDeleteGroup,
  onOpenEditGroup,
  onOpenCreateGroup,
  onRefreshData,
  isSyncing = false,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'full'>('all');
  const [deleteTargetGroup, setDeleteTargetGroup] = useState<Group | null>(null);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      // Course filter
      if (selectedCourseId !== 'all' && group.courseId !== selectedCourseId) {
        return false;
      }

      const stats = getGroupStats(group, members);

      // Status filter
      if (statusFilter === 'available' && (stats.isFull || group.status === 'CLOSED')) {
        return false;
      }
      if (statusFilter === 'full' && !stats.isFull) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const course = courses.find((c) => c.id === group.courseId);
        const matchName = group.name.toLowerCase().includes(query);
        const matchTopic = group.topic.toLowerCase().includes(query);
        const matchDesc = group.description.toLowerCase().includes(query);
        const matchSkills = group.requiredSkills.some((s) => s.toLowerCase().includes(query));
        const matchCourse = course?.name.toLowerCase().includes(query) || course?.code.toLowerCase().includes(query);
        return matchName || matchTopic || matchDesc || matchSkills || matchCourse;
      }

      return true;
    });
  }, [groups, members, courses, selectedCourseId, statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Perekrutan Anggota Tugas Kelompok Terstruktur</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Cari Teman Se-Kelompok Tugas Kuliah yang Selaras & Komitmen
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
            Kuota anggota tiap kelompok diatur langsung oleh ketua agar pembagian tugas adil dan merata. Pilih mata kuliah,
            lihat peran yang masih dibutuhkan, dan daftarkan dirimu langsung. Ketua kelompok akan meninjau dan menghubungimu via WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('daftar-kelompok');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <Users2 className="w-4 h-4" />
              <span>Jelajahi Kelompok</span>
            </button>

            <button
              onClick={onOpenCheckStatus}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm backdrop-blur-xs border border-white/10 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cek Status Pendaftaran Saya</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Badges in Hero */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400">Total Mata Kuliah</div>
            <div className="text-xl font-bold text-white mt-0.5">{courses.length} Matkul</div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400">Kelompok Dibuka</div>
            <div className="text-xl font-bold text-white mt-0.5">{groups.length} Kelompok</div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400">Mahasiswa Bergabung</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {members.filter((m) => m.status === 'APPROVED').length} Mahasiswa
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400">Komunikasi Tim</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">WhatsApp Langsung</div>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <section id="daftar-kelompok" className="space-y-6">
        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          {/* Top row: search & status filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama kelompok, topik tugas, keahlian, atau nama matkul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter & Create Group Button */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({groups.length})
                </button>
                <button
                  onClick={() => setStatusFilter('available')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'available'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Slot Buka
                </button>
                <button
                  onClick={() => setStatusFilter('full')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'full'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kuota Penuh
                </button>
              </div>

              {/* Refresh / Sync Data button for everyone */}
              {onRefreshData && (
                <button
                  onClick={onRefreshData}
                  disabled={isSyncing}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all shrink-0 cursor-pointer"
                  title="Segarkan data kelompok terbaru dari Google Sheets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                  <span className="hidden sm:inline">Perbarui</span>
                </button>
              )}

              {/* Tambah Kelompok - HANYA UNTUK ADMIN */}
              {isAdminLoggedIn && onOpenCreateGroup && (
                <button
                  onClick={onOpenCreateGroup}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                  title="Tambah Kelompok Baru (Hanya Admin)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kelompok</span>
                </button>
              )}
            </div>
          </div>

          {/* Course Tabs (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Mata Kuliah:
            </span>
            <button
              onClick={() => setSelectedCourseId('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedCourseId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Mata Kuliah
            </button>
            {courses.map((course) => {
              const countInCourse = groups.filter((g) => g.courseId === course.id).length;
              const isSelected = selectedCourseId === course.id;
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: course.color || '#3b82f6' }}
                  />
                  <span>{course.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>
                    {countInCourse}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Groups Cards Grid */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Belum Ada Kelompok Terbuka</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              {isAdminLoggedIn
                ? 'Saat ini belum ada kelompok yang dibuka. Klik tombol di bawah untuk menambahkan kelompok baru, dan kelompok akan langsung tampil untuk semua orang di website.'
                : 'Saat ini belum ada kelompok yang dibuka. Kelompok tugas kuliah akan otomatis tampil di sini setelah dibuat oleh Admin/Ketua.'}
            </p>
            {isAdminLoggedIn && onOpenCreateGroup ? (
              <button
                onClick={onOpenCreateGroup}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelompok Baru</span>
              </button>
            ) : onSwitchToAdmin ? (
              <button
                onClick={onSwitchToAdmin}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Masuk Sebagai Admin</span>
              </button>
            ) : null}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tidak Ada Kelompok Ditemukan</h3>
            <p className="text-sm text-slate-500 mb-6">
              Tidak ada kelompok yang sesuai dengan filter atau kata kunci pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSelectedCourseId('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.map((group) => {
              const course = courses.find((c) => c.id === group.courseId);
              const stats = getGroupStats(group, members);
              const isClosed = group.status === 'CLOSED';

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 pb-4">
                    {/* Top Row: Course Tag, Status Badge & Admin Actions */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold">{course?.code}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {course?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Status Badge */}
                        {isClosed ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            Ditutup
                          </span>
                        ) : stats.isFull ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Kuota Penuh
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Sisa {stats.remainingSlots} Slot
                          </span>
                        )}

                        {/* Quick Group Actions (Edit & Hapus) - HANYA UNTUK ADMIN */}
                        {isAdminLoggedIn && (onOpenEditGroup || onDeleteGroup) && (
                          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-1">
                            {onOpenEditGroup && (
                              <button
                                onClick={() => onOpenEditGroup(group)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Edit Kelompok & Kuota"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteGroup && (
                              <button
                                onClick={() => setDeleteTargetGroup(group)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Hapus Kelompok Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Group Title & Topic */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5">
                      {group.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 mb-2.5">
                      Topik: {group.topic}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {group.description}
                    </p>

                    {/* Quota Progress Bar */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-600 flex items-center gap-1">
                          <Users2 className="w-3.5 h-3.5 text-slate-500" />
                          Kuota Anggota:
                        </span>
                        <span className="font-bold text-slate-800">
                          {stats.filledCount} dari {stats.max} Anggota Terisi ({stats.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            stats.isFull
                              ? 'bg-rose-500'
                              : stats.percentage >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                        <span>Ditentukan oleh Admin/Ketua</span>
                        <span>{stats.remainingSlots > 0 ? `${stats.remainingSlots} kursi kosong` : 'Kelompok sudah lengkap'}</span>
                      </div>
                    </div>

                    {/* Required Skills Badges */}
                    {group.requiredSkills && group.requiredSkills.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Peran / Keahlian yang Dicari:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.requiredSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Member Avatars & List */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Anggota yang Telah Bergabung ({stats.approvedMembers.length}):
                      </div>
                      {stats.approvedMembers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada anggota (jadilah yang pertama!)</p>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {stats.approvedMembers.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                                  {m.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-800">{m.name}</span>
                                  <span className="text-slate-400 text-[10px] ml-1.5 font-mono">({m.nim})</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {m.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-slate-50/80 p-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Ketua & WA info */}
                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppChatUrl(
                          group.leaderWa,
                          `Halo ${group.leaderName}, saya ingin bertanya tentang Kelompok "${group.name}" untuk matkul ${course?.name}...`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                        title="Tanya atau diskusi langsung dengan Ketua via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat Ketua (WA)</span>
                      </a>

                      {group.deadline && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Deadline: {formatDateIndo(group.deadline)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button: Daftar or Status */}
                    {isClosed ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-500 cursor-not-allowed"
                      >
                        Pendaftaran Ditutup
                      </button>
                    ) : stats.isFull ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-500 cursor-not-allowed"
                      >
                        Kuota Penuh
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenJoinModal(group)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Daftar Gabung Kelompok</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Konfirmasi Hapus Kelompok */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetGroup)}
        title={deleteTargetGroup ? `Hapus Kelompok "${deleteTargetGroup.name}"` : ''}
        message="Apakah Anda yakin ingin menghapus kelompok ini? Kartu kelompok akan langsung hilang dari website."
        confirmLabel="Ya, Hapus Kelompok"
        onConfirm={() => {
          if (deleteTargetGroup && onDeleteGroup) {
            onDeleteGroup(deleteTargetGroup.id);
            setDeleteTargetGroup(null);
          }
        }}
        onClose={() => setDeleteTargetGroup(null)}
      />
    </div>
  );
};
