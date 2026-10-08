import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Info,
  ShieldCheck,
  Settings,
  KeyRound,
  Download,
  Upload,
  Copy,
  UserX,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Course, Group, Member, AppScriptConfig, AdminProfile } from '../types';
import { getGroupStats, getWhatsAppChatUrl, formatDateIndo } from '../utils/formatters';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface AdminDashboardProps {
  courses: Course[];
  groups: Group[];
  members: Member[];
  appScriptConfig: AppScriptConfig;
  adminProfile: AdminProfile;
  onSaveAppScriptConfig: (config: AppScriptConfig) => void;
  onSaveAdminProfile: (profile: AdminProfile) => void;
  onOpenCreateGroup: () => void;
  onOpenEditGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeleteMultipleGroups?: (groupIds: string[]) => void;
  onClearAllGroups?: () => void;
  onClearGroupMembers?: (groupId: string) => void;
  onOpenCreateCourse: () => void;
  onOpenEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onDeleteMultipleCourses?: (courseIds: string[]) => void;
  onClearAllCourses?: () => void;
  onClearCourseGroups?: (courseId: string) => void;
  onApproveMember: (memberId: string) => void;
  onRejectMember: (memberId: string, notes?: string) => void;
  onDeleteMember: (memberId: string) => void;
  onDeleteMultipleMembers?: (memberIds: string[]) => void;
  onClearAllMembers?: () => void;
  onSyncAllToSheets: () => Promise<void>;
  onPullFromSheets: () => Promise<void>;
  onTestConnection: (url: string) => Promise<boolean>;
  onOpenAppsScriptModal: () => void;
  onResetAllData: () => void;
  isSyncing: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  courses,
  groups,
  members,
  appScriptConfig,
  adminProfile,
  onSaveAppScriptConfig,
  onSaveAdminProfile,
  onOpenCreateGroup,
  onOpenEditGroup,
  onDeleteGroup,
  onDeleteMultipleGroups,
  onClearAllGroups,
  onClearGroupMembers,
  onOpenCreateCourse,
  onOpenEditCourse,
  onDeleteCourse,
  onDeleteMultipleCourses,
  onClearAllCourses,
  onClearCourseGroups,
  onApproveMember,
  onRejectMember,
  onDeleteMember,
  onDeleteMultipleMembers,
  onClearAllMembers,
  onSyncAllToSheets,
  onPullFromSheets,
  onTestConnection,
  onOpenAppsScriptModal,
  onResetAllData,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'members' | 'courses' | 'sheets' | 'settings'>('groups');
  
  // Selection states for bulk actions
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // In-App Confirmation Modal state (No window.confirm!)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Filter states
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [memberSearch, setMemberSearch] = useState('');

  // Apps Script form states
  const [sheetUrlInput, setSheetUrlInput] = useState(appScriptConfig.webAppUrl);
  const [spreadsheetLinkInput, setSpreadsheetLinkInput] = useState(appScriptConfig.spreadsheetUrl);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Admin Profile form states
  const [adminNameInput, setAdminNameInput] = useState(adminProfile.name);
  const [adminPhoneInput, setAdminPhoneInput] = useState(adminProfile.phone);
  const [adminPinInput, setAdminPinInput] = useState(adminProfile.pin);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Reject modal state
  const [rejectingMemberId, setRejectingMemberId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Computed metrics
  const totalApproved = members.filter((m) => m.status === 'APPROVED').length;
  const totalPending = members.filter((m) => m.status === 'PENDING').length;
  const totalSlots = groups.reduce((acc, g) => acc + (g.maxMembers || 0), 0);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    if (selectedCourseFilter !== 'all' && m.courseId !== selectedCourseFilter) return false;
    if (selectedGroupFilter !== 'all' && m.groupId !== selectedGroupFilter) return false;
    if (memberStatusFilter !== 'all' && m.status !== memberStatusFilter) return false;
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      const match =
        m.name.toLowerCase().includes(q) ||
        m.nim.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.skills.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filtered groups list
  const filteredGroups = groups.filter((g) => {
    if (selectedCourseFilter !== 'all' && g.courseId !== selectedCourseFilter) return false;
    return true;
  });

  // Handle Save Sheet Settings
  const handleSaveSheetConfig = () => {
    onSaveAppScriptConfig({
      ...appScriptConfig,
      webAppUrl: sheetUrlInput.trim(),
      spreadsheetUrl: spreadsheetLinkInput.trim(),
    });
    setTestResult({
      status: 'idle',
      message: 'Pengaturan Google Apps Script tersimpan!',
    });
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    if (!sheetUrlInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }
    setTestResult({ status: 'testing', message: 'Menguji koneksi ke Google Apps Script...' });
    const success = await onTestConnection(sheetUrlInput.trim());
    if (success) {
      setTestResult({
        status: 'success',
        message: 'Koneksi Berhasil! Google Apps Script siap digunakan.',
      });
    } else {
      setTestResult({
        status: 'error',
        message: 'Koneksi Gagal. Pastikan deployment berstatus "Who has access: Anyone".',
      });
    }
  };

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAdminProfile({
      ...adminProfile,
      name: adminNameInput.trim(),
      phone: adminPhoneInput.trim(),
      pin: adminPinInput.trim() || 'admin123',
    });
    setProfileSuccessMsg('Profil dan PIN Admin berhasil diperbarui!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Sync Action */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Dashboard Manajemen Admin</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Akses Penuh
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pengelola: <span className="font-semibold text-slate-800">{adminProfile.name}</span> • Atur kuota anggota, tinjau pendaftar, dan sinkronisasi ke Google Sheets.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onSyncAllToSheets}
            disabled={isSyncing}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-60"
            title="Kirim seluruh data lokal ke Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron ke Sheets'}</span>
          </button>

          <button
            onClick={onOpenAppsScriptModal}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kode Apps Script</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Mata Kuliah</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{courses.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Aktif semester ini</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Kelompok Terbuka</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{groups.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total kuota: {totalSlots} kursi</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Anggota Diterima</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalApproved}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalSlots > 0 ? `${Math.round((totalApproved / totalSlots) * 100)}% kuota terisi` : '-'}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          totalPending > 0
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-white border-slate-200/80'
        }`}>
          <div className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Perlu Ditinjau</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{totalPending}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            {totalPending > 0 ? 'Menunggu persetujuan Anda' : 'Semua sudah ditinjau'}
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 flex overflow-x-auto gap-1 shadow-xs scrollbar-none touch-pan-x">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'groups'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Kelompok ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all relative shrink-0 ${
            activeTab === 'members'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Pendaftar &amp; Anggota ({members.length})</span>
          {totalPending > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {totalPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mata Kuliah ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'sheets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets &amp; Apps Script</span>
          {appScriptConfig.webAppUrl ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Akun</span>
        </button>
      </div>

      {/* TAB 1: KELOLA KELOMPOK */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            {/* Filter by course */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Matkul:</span>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-medium"
              >
                <option value="all">Semua Mata Kuliah ({groups.length})</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

              {/* Group Action Buttons: Bulk Delete, Clear Filtered, Clear All, Create */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedGroupIds.length > 0 && (
                <button
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: `Hapus ${selectedGroupIds.length} Kelompok Terpilih`,
                      message: `Apakah Anda yakin ingin menghapus ${selectedGroupIds.length} kelompok yang dipilih? Seluruh data pendaftar di kelompok ini juga akan terhapus.`,
                      confirmLabel: `Hapus (${selectedGroupIds.length})`,
                      onConfirm: () => {
                        if (onDeleteMultipleGroups) {
                          onDeleteMultipleGroups(selectedGroupIds);
                        } else {
                          selectedGroupIds.forEach((id) => onDeleteGroup(id));
                        }
                        setSelectedGroupIds([]);
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedGroupIds.length})</span>
                </button>
              )}

              {selectedCourseFilter !== 'all' && filteredGroups.length > 0 && (
                <button
                  onClick={() => {
                    const targetCourse = courses.find((c) => c.id === selectedCourseFilter);
                    setDeleteModal({
                      isOpen: true,
                      title: `Kosongkan Kelompok di Matkul "${targetCourse?.name}"`,
                      message: `Hapus seluruh ${filteredGroups.length} kelompok beserta anggotanya pada mata kuliah ini?`,
                      confirmLabel: `Kosongkan (${filteredGroups.length} Kelompok)`,
                      onConfirm: () => {
                        if (onClearCourseGroups) {
                          onClearCourseGroups(selectedCourseFilter);
                        } else {
                          filteredGroups.forEach((g) => onDeleteGroup(g.id));
                        }
                        setSelectedGroupIds([]);
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-all"
                  title="Hapus seluruh kelompok pada mata kuliah yang sedang difilter"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kosongkan di Matkul Ini ({filteredGroups.length})</span>
                </button>
              )}

              {groups.length > 0 && (
                <button
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: 'Kosongkan Seluruh Kelompok',
                      message: 'PERINGATAN: Semua kelompok dan pendaftar di dalamnya akan dihapus. Anda dapat membuat kelompok baru kembali kapan saja.',
                      confirmLabel: 'Ya, Kosongkan Semua',
                      onConfirm: () => {
                        if (onClearAllGroups) {
                          onClearAllGroups();
                        } else {
                          groups.forEach((g) => onDeleteGroup(g.id));
                        }
                        setSelectedGroupIds([]);
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
                  title="Hapus seluruh kelompok dan anggotanya"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Semua Kelompok</span>
                </button>
              )}

              {/* Create Group Button */}
              <button
                onClick={onOpenCreateGroup}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelompok Baru</span>
              </button>
            </div>
          </div>

          {/* Group table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredGroups.length > 0 &&
                          filteredGroups.every((g) => selectedGroupIds.includes(g.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allFilteredIds = filteredGroups.map((g) => g.id);
                            setSelectedGroupIds(Array.from(new Set([...selectedGroupIds, ...allFilteredIds])));
                          } else {
                            const filteredIdSet = new Set(filteredGroups.map((g) => g.id));
                            setSelectedGroupIds(selectedGroupIds.filter((id) => !filteredIdSet.has(id)));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        title="Pilih Semua Kelompok"
                      />
                    </th>
                    <th className="p-3.5">Nama Kelompok</th>
                    <th className="p-3.5">Mata Kuliah</th>
                    <th className="p-3.5">Topik &amp; Deskripsi</th>
                    <th className="p-3.5 text-center">Kuota Anggota</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Batas Deadline</th>
                    <th className="p-3.5 pr-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Tidak ada kelompok pada filter ini. Klik &ldquo;Tambah Kelompok Baru&rdquo; untuk membuatnya.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => {
                      const course = courses.find((c) => c.id === group.courseId);
                      const stats = getGroupStats(group, members);
                      const isSelected = selectedGroupIds.includes(group.id);

                      return (
                        <tr
                          key={group.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGroupIds([...selectedGroupIds, group.id]);
                                } else {
                                  setSelectedGroupIds(selectedGroupIds.filter((id) => id !== group.id));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">
                            <div>{group.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              Ketua: {group.leaderName}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {course?.code}
                            </span>
                            <div className="text-[11px] text-slate-600 truncate max-w-[140px] mt-0.5">
                              {course?.name}
                            </div>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <div className="font-semibold text-slate-800 line-clamp-1">{group.topic}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {group.description || '-'}
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="font-bold text-slate-900">
                              {stats.filledCount} / {stats.max} Orang
                            </div>
                            <div className="w-20 bg-slate-200 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  stats.isFull ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${stats.percentage}%` }}
                              />
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            {group.status === 'CLOSED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                Ditutup
                              </span>
                            ) : stats.isFull ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Penuh ({stats.filledCount})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Buka ({stats.remainingSlots} slot)
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {formatDateIndo(group.deadline)}
                          </td>
                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onOpenEditGroup(group)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Edit Kelompok & Kuota"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Kosongkan Anggota Kelompok Ini */}
                              {stats.groupMembers.length > 0 && (
                                <button
                                  onClick={() => {
                                    setDeleteModal({
                                      isOpen: true,
                                      title: `Kosongkan Anggota "${group.name}"`,
                                      message: `Apakah Anda ingin mengosongkan seluruh anggota (${stats.groupMembers.length} orang) pada kelompok ini? Kelompok tetap ada, tetapi slotnya akan kembali kosong.`,
                                      confirmLabel: 'Kosongkan Anggota',
                                      onConfirm: () => {
                                        if (onClearGroupMembers) {
                                          onClearGroupMembers(group.id);
                                        }
                                      },
                                    });
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                  title="Kosongkan seluruh anggota di kelompok ini saja"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setDeleteModal({
                                    isOpen: true,
                                    title: `Hapus Kelompok "${group.name}"`,
                                    message: `Apakah Anda yakin ingin menghapus kelompok "${group.name}"? Pendaftar di kelompok ini juga akan terhapus.`,
                                    confirmLabel: 'Hapus Kelompok',
                                    onConfirm: () => onDeleteGroup(group.id),
                                  });
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Hapus Kelompok"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDAFTAR & ANGGOTA (APPROVAL) */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama mahasiswa, NIM, keahlian, atau peran..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setMemberStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    memberStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Semua ({members.length})
                </button>
                <button
                  onClick={() => setMemberStatusFilter('PENDING')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    memberStatusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Perlu Review ({members.filter((m) => m.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => setMemberStatusFilter('APPROVED')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    memberStatusFilter === 'APPROVED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Diterima ({members.filter((m) => m.status === 'APPROVED').length})
                </button>
                <button
                  onClick={() => setMemberStatusFilter('REJECTED')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    memberStatusFilter === 'REJECTED' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Ditolak
                </button>
              </div>
            </div>

            {/* Course & Group filter dropdowns + Clear / Bulk actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Matkul:</span>
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => {
                      setSelectedCourseFilter(e.target.value);
                      setSelectedGroupFilter('all');
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value="all">Semua Mata Kuliah</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Kelompok:</span>
                  <select
                    value={selectedGroupFilter}
                    onChange={(e) => setSelectedGroupFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value="all">Semua Kelompok</option>
                    {groups
                      .filter((g) => selectedCourseFilter === 'all' || g.courseId === selectedCourseFilter)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Bulk / Clear Actions for Members */}
              <div className="flex items-center gap-2">
                {selectedMemberIds.length > 0 && (
                  <button
                    onClick={() => {
                      setDeleteModal({
                        isOpen: true,
                        title: `Hapus ${selectedMemberIds.length} Pendaftar Terpilih`,
                        message: `Apakah Anda yakin ingin menghapus data ${selectedMemberIds.length} pendaftar yang dipilih?`,
                        confirmLabel: `Hapus (${selectedMemberIds.length})`,
                        onConfirm: () => {
                          if (onDeleteMultipleMembers) {
                            onDeleteMultipleMembers(selectedMemberIds);
                          } else {
                            selectedMemberIds.forEach((id) => onDeleteMember(id));
                          }
                          setSelectedMemberIds([]);
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Terpilih ({selectedMemberIds.length})</span>
                  </button>
                )}

                {members.length > 0 && (
                  <button
                    onClick={() => {
                      setDeleteModal({
                        isOpen: true,
                        title: 'Kosongkan Seluruh Pendaftar',
                        message: 'PERINGATAN: Semua data pendaftar & anggota kelompok akan dihapus dari sistem. Kelompok mata kuliah tetap ada tetapi seluruh anggota akan dikosongkan.',
                        confirmLabel: 'Ya, Kosongkan Semua',
                        onConfirm: () => {
                          if (onClearAllMembers) {
                            onClearAllMembers();
                          } else {
                            members.forEach((m) => onDeleteMember(m.id));
                          }
                          setSelectedMemberIds([]);
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
                    title="Kosongkan seluruh data pendaftar dan anggota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Semua Pendaftar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredMembers.length > 0 &&
                          filteredMembers.every((m) => selectedMemberIds.includes(m.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allFilteredIds = filteredMembers.map((m) => m.id);
                            setSelectedMemberIds(Array.from(new Set([...selectedMemberIds, ...allFilteredIds])));
                          } else {
                            const filteredIdSet = new Set(filteredMembers.map((m) => m.id));
                            setSelectedMemberIds(selectedMemberIds.filter((id) => !filteredIdSet.has(id)));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        title="Pilih Semua Pendaftar"
                      />
                    </th>
                    <th className="p-3.5">Nama Mahasiswa &amp; NIM</th>
                    <th className="p-3.5">Kelompok &amp; Matkul</th>
                    <th className="p-3.5">Peran &amp; Keahlian</th>
                    <th className="p-3.5">Komitmen</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Kontak WhatsApp</th>
                    <th className="p-3.5 pr-5 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Tidak ada pendaftar yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const group = groups.find((g) => g.id === member.groupId);
                      const course = courses.find((c) => c.id === member.courseId);
                      const stats = group ? getGroupStats(group, members) : null;
                      const isSelected = selectedMemberIds.includes(member.id);

                      return (
                        <tr
                          key={member.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected
                              ? 'bg-blue-50/40'
                              : member.status === 'PENDING'
                              ? 'bg-amber-50/30'
                              : ''
                          }`}
                        >
                          <td className="p-3.5 pl-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMemberIds([...selectedMemberIds, member.id]);
                                } else {
                                  setSelectedMemberIds(selectedMemberIds.filter((id) => id !== member.id));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{member.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">{member.nim}</div>
                            {member.email && (
                              <div className="text-[10px] text-slate-400">{member.email}</div>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800">{group?.name || '-'}</div>
                            <div className="text-[11px] text-blue-700">
                              {course?.code} - {course?.name}
                            </div>
                            {stats && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Kuota: {stats.filledCount}/{stats.max} terisi
                              </div>
                            )}
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <span className="inline-block px-2 py-0.5 rounded-md font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 text-[11px] mb-1">
                              {member.role}
                            </span>
                            <div className="text-[11px] text-slate-600 line-clamp-2">
                              {member.skills || 'Tidak mencantumkan tools'}
                            </div>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <div className="text-[11px] text-slate-600 line-clamp-2 italic">
                              &ldquo;{member.commitment || '-'}&rdquo;
                            </div>
                            {member.notes && (
                              <div className="text-[10px] text-amber-700 mt-1 font-medium">
                                Catatan: {member.notes}
                              </div>
                            )}
                          </td>

                          <td className="p-3.5">
                            {member.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Disetujui
                              </span>
                            )}
                            {member.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending
                              </span>
                            )}
                            {member.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Ditolak
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <a
                              href={getWhatsAppChatUrl(
                                member.whatsapp,
                                member.status === 'APPROVED'
                                  ? `Halo ${member.name}, selamat! Pendaftaranmu untuk "${group?.name}" pada mata kuliah ${course?.name} telah DISETUJUI. Silakan bergabung ke tautan grup WA kelompok: ${group?.waGroupLink || 'segera kami kabari'}. Terima kasih!`
                                  : `Halo ${member.name}, saya ${adminProfile.name} (Ketua Kelompok ${group?.name}). Ingin mengonfirmasi mengenai pendaftaranmu...`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors"
                              title="Kirim pesan WhatsApp otomatis ke mahasiswa ini"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{member.whatsapp}</span>
                            </a>
                          </td>

                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* APPROVE BUTTON */}
                              {member.status !== 'APPROVED' && (
                                <button
                                  onClick={() => {
                                    if (stats && stats.isFull) {
                                      setDeleteModal({
                                        isOpen: true,
                                        title: 'Peringatan: Kuota Kelompok Penuh',
                                        message: `Kuota kelompok "${group?.name}" sudah penuh (${stats.filledCount}/${stats.max}). Apakah Anda tetap ingin menyetujui pendaftar ${member.name}?`,
                                        confirmLabel: 'Tetap Setujui',
                                        onConfirm: () => onApproveMember(member.id),
                                      });
                                      return;
                                    }
                                    onApproveMember(member.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                                  title="Setujui pendaftar ini masuk kelompok"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Terima</span>
                                </button>
                              )}

                              {/* REJECT BUTTON */}
                              {member.status !== 'REJECTED' && (
                                <button
                                  onClick={() => {
                                    setRejectingMemberId(member.id);
                                    setRejectNote('');
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                  title="Tolak pendaftaran"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* DELETE BUTTON */}
                              <button
                                onClick={() => {
                                  setDeleteModal({
                                    isOpen: true,
                                    title: `Hapus Data Pendaftar`,
                                    message: `Apakah Anda yakin ingin menghapus data ${member.name} (${member.nim}) dari sistem?`,
                                    confirmLabel: 'Hapus Pendaftar',
                                    onConfirm: () => onDeleteMember(member.id),
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Hapus permanen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA MATA KULIAH */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Mata Kuliah ({courses.length})</h3>
              <p className="text-xs text-slate-500">
                Setiap mata kuliah dapat memiliki banyak kelompok dengan kuota yang berbeda-beda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk delete selected courses */}
              {selectedCourseIds.length > 0 && (
                <button
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: `Hapus ${selectedCourseIds.length} Mata Kuliah Terpilih`,
                      message: `Hapus ${selectedCourseIds.length} mata kuliah yang dipilih beserta seluruh kelompok dan anggotanya?`,
                      confirmLabel: `Hapus (${selectedCourseIds.length})`,
                      onConfirm: () => {
                        if (onDeleteMultipleCourses) {
                          onDeleteMultipleCourses(selectedCourseIds);
                        } else {
                          selectedCourseIds.forEach((id) => onDeleteCourse(id));
                        }
                        setSelectedCourseIds([]);
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedCourseIds.length})</span>
                </button>
              )}

              {/* Clear all courses */}
              {courses.length > 0 && (
                <button
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: 'Kosongkan Seluruh Mata Kuliah',
                      message: 'PERINGATAN: Seluruh mata kuliah beserta semua kelompok dan pendaftar di dalamnya akan dihapus.',
                      confirmLabel: 'Ya, Kosongkan Semua',
                      onConfirm: () => {
                        if (onClearAllCourses) {
                          onClearAllCourses();
                        } else {
                          courses.forEach((c) => onDeleteCourse(c.id));
                        }
                        setSelectedCourseIds([]);
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
                  title="Hapus seluruh mata kuliah"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Semua Matkul</span>
                </button>
              )}

              <button
                onClick={onOpenCreateCourse}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Mata Kuliah</span>
              </button>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Belum Ada Mata Kuliah</h4>
              <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                Mata kuliah telah dikosongkan. Klik tombol di bawah untuk membuat mata kuliah baru.
              </p>
              <button
                onClick={onOpenCreateCourse}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Mata Kuliah Baru</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const groupCount = groups.filter((g) => g.courseId === course.id).length;
                const memberCount = members.filter((m) => m.courseId === course.id && m.status === 'APPROVED').length;
                const isSelected = selectedCourseIds.includes(course.id);

                return (
                  <div
                    key={course.id}
                    className={`bg-white p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                      isSelected ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCourseIds([...selectedCourseIds, course.id]);
                              } else {
                                setSelectedCourseIds(selectedCourseIds.filter((id) => id !== course.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <span
                            className="px-2.5 py-1 rounded-md text-xs font-bold text-white"
                            style={{ backgroundColor: course.color || '#3b82f6' }}
                          >
                            {course.code}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{course.sks} SKS</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base mb-1">{course.name}</h4>
                      {course.lecturer ? (
                        <p className="text-xs text-slate-600 mb-2">Dosen: {course.lecturer}</p>
                      ) : null}
                      <p className="text-[11px] text-slate-400">{course.semester}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span>{groupCount} Kelompok Dibuat</span>
                        <span>{memberCount} Mahasiswa Diterima</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                      {groupCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteModal({
                              isOpen: true,
                              title: `Kosongkan Kelompok di ${course.name}`,
                              message: `Hapus semua kelompok (${groupCount} kelompok) beserta pendaftarnya pada mata kuliah ini? Mata kuliah tetap tersimpan.`,
                              confirmLabel: `Kosongkan (${groupCount} Kelompok)`,
                              onConfirm: () => {
                                if (onClearCourseGroups) {
                                  onClearCourseGroups(course.id);
                                }
                              },
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Hapus seluruh kelompok di mata kuliah ini saja"
                        >
                          <UserX className="w-3 h-3 text-amber-600" />
                          <span>Kosongkan Kelompok</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenEditCourse(course)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteModal({
                            isOpen: true,
                            title: `Hapus Mata Kuliah "${course.name}"`,
                            message: `Apakah Anda yakin ingin menghapus mata kuliah "${course.name}" (${course.code})? Seluruh kelompok dan pendaftar di dalamnya juga akan terhapus permanen.`,
                            confirmLabel: 'Hapus Mata Kuliah',
                            onConfirm: () => onDeleteCourse(course.id),
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GOOGLE SHEETS & APPS SCRIPT INTEGRATION */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold border border-white/20">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Integrasi Google Spreadsheet Tanpa Database Eksternal</span>
                </div>
                <h3 className="text-xl font-bold">Sinkronisasi Google Sheets via Google Apps Script</h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Hubungkan URL Web App Apps Script Anda. Setiap data kelompok, batas kuota, dan formulir pendaftaran anggota
                  akan otomatis tersimpan rapi di spreadsheet Anda.
                </p>
              </div>

              <button
                onClick={onOpenAppsScriptModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-all shrink-0"
              >
                <span>Lihat Kode & Panduan Lengkap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h4 className="font-bold text-slate-900 text-sm">Konfigurasi Endpoint Google Apps Script</h4>

            {testResult.message && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 border ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : testResult.status === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {testResult.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {testResult.status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                {testResult.status === 'testing' && <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Web App URL Google Apps Script <span className="text-emerald-600 font-semibold">(Permanen &amp; Terhubung)</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Terpasang Permanen
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={testResult.status === 'testing'}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors shrink-0"
                  >
                    Tes Koneksi
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  ✓ URL ini sudah disimpan secara permanen di kode aplikasi, Anda tidak perlu lagi memasukkannya secara manual setiap kali membuka webapp.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tautan Google Spreadsheet Anda (Opsional, untuk jalan pintas)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={spreadsheetLinkInput}
                    onChange={(e) => setSpreadsheetLinkInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-mono"
                  />
                  {spreadsheetLinkInput && (
                    <a
                      href={spreadsheetLinkInput}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Sheet</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleSaveSheetConfig}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                Simpan Konfigurasi
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onPullFromSheets}
                  disabled={!sheetUrlInput || isSyncing}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors disabled:opacity-50"
                  title="Ambil data dari Google Sheets jika diedit manual di sana"
                >
                  Tarik Data dari Sheets
                </button>

                <button
                  onClick={onSyncAllToSheets}
                  disabled={!sheetUrlInput || isSyncing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sinkron Seluruh Data Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PENGATURAN AKUN ADMIN & RESET */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-xl">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Profil Admin & Keamanan</span>
            </h3>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Admin / Pemilik Kelompok
                </label>
                <input
                  type="text"
                  required
                  value={adminNameInput}
                  onChange={(e) => setAdminNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Admin (Untuk dihubungi anggota)
                </label>
                <input
                  type="tel"
                  required
                  value={adminPhoneInput}
                  onChange={(e) => setAdminPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  PIN / Password Masuk Admin
                </label>
                <input
                  type="text"
                  required
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan untuk membuka Dashboard Admin. Default: &ldquo;admin123&rdquo;.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                Simpan Perubahan Profil
              </button>
            </form>
          </div>

          {/* PUSAT PEMBERSIHAN & PENGOSONGAN DATA */}
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Pusat Pembersihan & Pengosongan Data</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan opsi di bawah ini untuk mengosongkan atau menghapus data kelompok, pendaftar, atau mata kuliah secara tuntas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: Kosongkan Seluruh Pendaftar */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Kosongkan Anggota ({members.length})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                    Pendaftar
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menghapus semua pendaftar & anggota. Kelompok dan mata kuliah tetap tersimpan.
                </p>
                <button
                  type="button"
                  disabled={members.length === 0}
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: 'Kosongkan Seluruh Pendaftar & Anggota',
                      message: `Hapus seluruh ${members.length} data pendaftar & anggota dari semua kelompok?`,
                      confirmLabel: 'Ya, Kosongkan Anggota',
                      onConfirm: () => {
                        if (onClearAllMembers) onClearAllMembers();
                        else members.forEach((m) => onDeleteMember(m.id));
                        setSelectedMemberIds([]);
                      },
                    });
                  }}
                  className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-[11px] transition-colors shadow-xs"
                >
                  Kosongkan Semua Pendaftar
                </button>
              </div>

              {/* Option 2: Kosongkan Seluruh Kelompok */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Kosongkan Kelompok ({groups.length})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-semibold">
                    Kelompok
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menghapus seluruh kelompok beserta anggotanya. Mata kuliah tetap tersimpan.
                </p>
                <button
                  type="button"
                  disabled={groups.length === 0}
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: 'Kosongkan Seluruh Kelompok',
                      message: `Hapus seluruh ${groups.length} kelompok beserta pendaftar di dalamnya?`,
                      confirmLabel: 'Ya, Kosongkan Kelompok',
                      onConfirm: () => {
                        if (onClearAllGroups) onClearAllGroups();
                        else groups.forEach((g) => onDeleteGroup(g.id));
                        setSelectedGroupIds([]);
                      },
                    });
                  }}
                  className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-[11px] transition-colors shadow-xs"
                >
                  Kosongkan Semua Kelompok
                </button>
              </div>

              {/* Option 3: Kosongkan Seluruh Mata Kuliah */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Kosongkan Matkul ({courses.length})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-semibold">
                    Mata Kuliah
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menghapus seluruh mata kuliah, kelompok, dan pendaftar di dalamnya.
                </p>
                <button
                  type="button"
                  disabled={courses.length === 0}
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: 'Kosongkan Seluruh Mata Kuliah',
                      message: `Hapus seluruh ${courses.length} mata kuliah beserta seluruh kelompok dan pendaftar?`,
                      confirmLabel: 'Ya, Kosongkan Matkul',
                      onConfirm: () => {
                        if (onClearAllCourses) onClearAllCourses();
                        else courses.forEach((c) => onDeleteCourse(c.id));
                        setSelectedCourseIds([]);
                      },
                    });
                  }}
                  className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-[11px] transition-colors shadow-xs"
                >
                  Kosongkan Semua Matkul
                </button>
              </div>

              {/* Option 4: Reset ke Data Awal */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Reset ke Data Contoh</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                    Default
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mengembalikan mata kuliah dan kelompok ke data contoh bawaan awal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      title: 'Reset Seluruh Data ke Data Awal',
                      message: 'PERINGATAN: Semua perubahan saat ini akan digantikan dengan data contoh awal aplikasi. Lanjutkan?',
                      confirmLabel: 'Ya, Reset ke Awal',
                      onConfirm: () => onResetAllData(),
                    });
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors shadow-xs"
                >
                  Reset ke Data Awal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Note Modal */}
      {rejectingMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Tolak Pendaftaran Mahasiswa</h3>
            <p className="text-xs text-slate-500">
              Berikan catatan alasan penolakan (opsional), misalnya &ldquo;Kuota peran ini sudah terpenuhi&rdquo;.
            </p>
            <textarea
              rows={2}
              placeholder="Alasan penolakan..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingMemberId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onRejectMember(rejectingMemberId, rejectNote);
                  setRejectingMemberId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Clear Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmLabel={deleteModal.confirmLabel}
        onConfirm={deleteModal.onConfirm}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
