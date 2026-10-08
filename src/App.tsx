import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/StudentView';
import { JoinGroupModal } from './components/JoinGroupModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GroupManagerModal } from './components/GroupManagerModal';
import { CourseManagerModal } from './components/CourseManagerModal';
import { RegistrationStatusModal } from './components/RegistrationStatusModal';
import { AppsScriptModal } from './components/AppsScriptModal';
import { Footer } from './components/Footer';
import { storage } from './services/storage';
import { appsScriptApi } from './services/appsScript';
import { Course, Group, Member, AppScriptConfig, AdminProfile } from './types';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

// Helper functions to normalize data from Google Sheets
const normalizeCoursesData = (rawCourses: unknown[], existingCourses: Course[] = []): Course[] => {
  const existingMap = new Map(existingCourses.map((c) => [c.id, c]));
  return rawCourses.map((c: any) => {
    const id = String(c.id || `crs-${c.code || 'unknown'}`);
    const prev = existingMap.get(id);
    return {
      id,
      code: String(c.code || prev?.code || ''),
      name: String(c.name || prev?.name || ''),
      lecturer: String(c.lecturer || prev?.lecturer || ''),
      sks: Number(c.sks) || prev?.sks || 3,
      semester: String(c.semester || prev?.semester || 'Semester Ganjil 2026/2027'),
      color: String(c.color || prev?.color || '#3b82f6'),
      createdAt: String(c.createdAt || prev?.createdAt || '2026-09-10T08:00:00.000Z'),
    };
  });
};

const normalizeGroupsData = (rawGroups: unknown[], existingGroups: Group[] = []): Group[] => {
  const existingMap = new Map(existingGroups.map((g) => [g.id, g]));
  return rawGroups.map((g: any) => {
    const id = String(g.id || '');
    const prev = existingMap.get(id);
    return {
      id,
      courseId: String(g.courseId || prev?.courseId || ''),
      name: String(g.name || prev?.name || 'Kelompok'),
      topic: String(g.topic || prev?.topic || ''),
      description: String(g.description || prev?.description || ''),
      maxMembers: Number(g.maxMembers) || prev?.maxMembers || 4,
      leaderName: String(g.leaderName || prev?.leaderName || ''),
      leaderWa: String(g.leaderWa || prev?.leaderWa || ''),
      status: (g.status === 'FULL' || g.status === 'CLOSED' ? g.status : (prev?.status || 'OPEN')),
      deadline: String(g.deadline || prev?.deadline || ''),
      requiredSkills: Array.isArray(g.requiredSkills)
        ? g.requiredSkills
        : typeof g.requiredSkills === 'string' && g.requiredSkills.trim()
        ? g.requiredSkills.split(',').map((s: string) => s.trim())
        : prev?.requiredSkills || ['Frontend', 'Backend', 'Laporan'],
      waGroupLink: String(g.waGroupLink || prev?.waGroupLink || ''),
      createdAt: String(g.createdAt || prev?.createdAt || '2026-10-01T00:00:00.000Z'),
    };
  });
};

const normalizeMembersData = (rawMembers: unknown[]): Member[] => {
  return rawMembers.map((m: any) => ({
    id: String(m.id || `mem-${Date.now()}`),
    groupId: String(m.groupId || ''),
    courseId: String(m.courseId || ''),
    name: String(m.name || ''),
    nim: String(m.nim || ''),
    whatsapp: String(m.whatsapp || ''),
    email: String(m.email || ''),
    role: String(m.role || ''),
    skills: String(m.skills || ''),
    commitment: String(m.commitment || ''),
    status: (m.status === 'APPROVED' || m.status === 'REJECTED' ? m.status : 'PENDING'),
    notes: String(m.notes || ''),
    registeredAt: String(m.registeredAt || new Date().toISOString()),
  }));
};

export default function App() {
  // Core application state
  const [courses, setCourses] = useState<Course[]>(() => storage.getCourses());
  const [members, setMembers] = useState<Member[]>(() => storage.getMembers());
  const [groups, setGroups] = useState<Group[]>(() => {
    const rawGroups = storage.getGroups();
    const rawMembers = storage.getMembers();
    return storage.refreshGroupStatuses(rawGroups, rawMembers);
  });
  const [appScriptConfig, setAppScriptConfig] = useState<AppScriptConfig>(() =>
    storage.getAppScriptConfig()
  );
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() =>
    storage.getAdminProfile()
  );
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() =>
    storage.isAdminLoggedIn()
  );

  // View navigation
  const [activeTab, setActiveTab] = useState<'student' | 'status' | 'admin'>('student');

  // Track deleted groups so background polling doesn't resurrect them
  const deletedGroupIdsRef = React.useRef<Set<string>>(new Set());

  // Modal states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedGroupForJoin, setSelectedGroupForJoin] = useState<Group | null>(null);

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<Group | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | null>(null);

  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Global Toast / Feedback state
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    storage.saveCourses(courses);
  }, [courses]);

  useEffect(() => {
    storage.saveMembers(members);
    setGroups((prevGroups) => storage.refreshGroupStatuses(prevGroups, members));
  }, [members]);

  useEffect(() => {
    storage.saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    storage.saveAppScriptConfig(appScriptConfig);
  }, [appScriptConfig]);

  useEffect(() => {
    storage.saveAdminProfile(adminProfile);
  }, [adminProfile]);

  useEffect(() => {
    storage.setAdminLoggedIn(isAdminLoggedIn);
  }, [isAdminLoggedIn]);

  // Otomatis tarik data terbaru dari Google Sheets saat aplikasi dibuka & polling berkala
  // Menjaga agar kelompok yang baru saja dibuat tidak hilang tertimpa data lama
  useEffect(() => {
    let isMounted = true;

    const pullLatestCloudData = async (silent = true) => {
      const url = appScriptConfig.webAppUrl;
      if (!url || !url.trim().startsWith('http')) return;

      try {
        if (!silent) setIsSyncing(true);
        const res = await appsScriptApi.pullData(url);
        if (!isMounted) return;

        if (res.status === 'success') {
          if (Array.isArray(res.courses) && res.courses.length > 0) {
            const rawCourses = res.courses;
            setCourses((prevCourses) => {
              const normCourses = normalizeCoursesData(rawCourses, prevCourses);
              if (JSON.stringify(prevCourses) === JSON.stringify(normCourses)) return prevCourses;
              storage.saveCourses(normCourses);
              return normCourses;
            });
          }
          if (Array.isArray(res.groups)) {
            const rawGroups = res.groups;
            setGroups((prevGroups) => {
              const normGroups = normalizeGroupsData(rawGroups, prevGroups);
              
              // 1. Abaikan kelompok remote yang sudah dihapus oleh user secara lokal
              const nonDeletedRemote = normGroups.filter(
                (g) => !deletedGroupIdsRef.current.has(g.id)
              );
              const remoteIds = new Set(nonDeletedRemote.map((g) => g.id));

              // 2. Pertahankan kelompok lokal yang baru dibuat agar tidak hilang saat Google Sheets belum selesai menulis
              const localPending = prevGroups.filter(
                (g) => !remoteIds.has(g.id) && !deletedGroupIdsRef.current.has(g.id)
              );

              const merged = [...localPending, ...nonDeletedRemote];
              if (JSON.stringify(prevGroups) === JSON.stringify(merged)) return prevGroups;
              storage.saveGroups(merged);
              return merged;
            });
          }
          if (Array.isArray(res.members)) {
            const rawMembers = res.members;
            setMembers((prevMembers) => {
              const normMembers = normalizeMembersData(rawMembers);
              const remoteMemberIds = new Set(normMembers.map((m) => m.id));
              const localPendingMembers = prevMembers.filter(
                (m) => !remoteMemberIds.has(m.id)
              );
              const mergedMembers = [...localPendingMembers, ...normMembers];
              if (JSON.stringify(prevMembers) === JSON.stringify(mergedMembers)) return prevMembers;
              storage.saveMembers(mergedMembers);
              return mergedMembers;
            });
          }
        }
      } catch (err) {
        console.warn('Auto-sync cloud notice:', err);
      } finally {
        if (isMounted && !silent) setIsSyncing(false);
      }
    };

    // 1. Tarik data langsung saat webapp pertama kali dibuka di browser manapun
    pullLatestCloudData(true);

    // 2. Polling setiap 20 detik agar perubahan langsung tampil untuk semua orang
    const intervalId = setInterval(() => {
      pullLatestCloudData(true);
    }, 20000);

    // 3. Tarik data saat tab browser aktif kembali
    const handleFocus = () => {
      pullLatestCloudData(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [appScriptConfig.webAppUrl]);

  // Handle new member registration from student view
  const handleRegisterMember = async (
    memberData: Omit<Member, 'id' | 'status' | 'registeredAt'>
  ): Promise<boolean> => {
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`,
      status: 'PENDING',
      registeredAt: new Date().toISOString(),
    };

    const updatedMembers = [newMember, ...members];
    setMembers(updatedMembers);

    // If Apps Script Web App URL is configured, push the registration to Google Sheets!
    if (appScriptConfig.webAppUrl && appScriptConfig.webAppUrl.trim()) {
      try {
        await appsScriptApi.registerMember(appScriptConfig.webAppUrl, newMember);
        showToast('Pendaftaran berhasil dicatat & disinkronisasi ke Google Sheets!', 'success');
      } catch (err: unknown) {
        console.warn('Apps Script sync note:', err);
        showToast('Pendaftaran tersimpan secara lokal. Sinkronisasi Google Sheets tertunda.', 'info');
      }
    } else {
      showToast('Pendaftaran berhasil dikirim! Menunggu persetujuan Admin/Ketua.', 'success');
    }

    return true;
  };

  // Admin Actions: Approve Member
  const handleApproveMember = async (memberId: string) => {
    const updated = members.map((m) =>
      m.id === memberId ? { ...m, status: 'APPROVED' as const } : m
    );
    setMembers(updated);
    showToast('Anggota berhasil disetujui bergabung!', 'success');

    // Sync to Apps Script if configured
    if (appScriptConfig.webAppUrl) {
      try {
        await appsScriptApi.updateMemberStatus(appScriptConfig.webAppUrl, memberId, 'APPROVED');
      } catch (e) {
        console.warn('Background sync status error:', e);
      }
    }
  };

  // Admin Actions: Reject Member
  const handleRejectMember = async (memberId: string, notes?: string) => {
    const updated = members.map((m) =>
      m.id === memberId
        ? { ...m, status: 'REJECTED' as const, notes: notes || m.notes }
        : m
    );
    setMembers(updated);
    showToast('Pendaftaran ditolak.', 'info');

    if (appScriptConfig.webAppUrl) {
      try {
        await appsScriptApi.updateMemberStatus(
          appScriptConfig.webAppUrl,
          memberId,
          'REJECTED',
          notes
        );
      } catch (e) {
        console.warn('Background sync status error:', e);
      }
    }
  };

  // Helper to sync latest changes to Google Sheets automatically when configured
  const syncToSheetsIfConfigured = async (
    c: Course[],
    g: Group[],
    m: Member[]
  ) => {
    if (appScriptConfig.webAppUrl && appScriptConfig.webAppUrl.trim()) {
      try {
        await appsScriptApi.syncAll(appScriptConfig.webAppUrl, c, g, m);
      } catch (e) {
        console.warn('Sync to Google Sheets after modification:', e);
      }
    }
  };

  // Admin Actions: Delete Member
  const handleDeleteMember = (memberId: string) => {
    const updated = members.filter((m) => m.id !== memberId);
    setMembers(updated);
    syncToSheetsIfConfigured(courses, groups, updated);
    showToast('Data pendaftar telah dihapus & disinkronkan.', 'info');
  };

  // Admin Actions: Clear all members
  const handleClearAllMembers = () => {
    setMembers([]);
    syncToSheetsIfConfigured(courses, groups, []);
    showToast('Seluruh pendaftar & anggota telah berhasil dikosongkan.', 'info');
  };

  // Admin Actions: Clear members of a specific group
  const handleClearGroupMembers = (groupId: string) => {
    const updated = members.filter((m) => m.groupId !== groupId);
    setMembers(updated);
    syncToSheetsIfConfigured(courses, groups, updated);
    showToast('Seluruh anggota pada kelompok ini telah berhasil dikosongkan.', 'info');
  };

  // Admin Actions: Delete multiple members
  const handleDeleteMultipleMembers = (memberIds: string[]) => {
    const idSet = new Set(memberIds);
    const updated = members.filter((m) => !idSet.has(m.id));
    setMembers(updated);
    syncToSheetsIfConfigured(courses, groups, updated);
    showToast(`${memberIds.length} pendaftar berhasil dihapus & disinkronkan.`, 'info');
  };

  // Admin Actions: Clear all groups - HANYA UNTUK ADMIN
  const handleClearAllGroups = () => {
    if (!isAdminLoggedIn) {
      showToast('Akses ditolak: Hanya Admin/Ketua yang dapat mengosongkan kelompok.', 'error');
      setIsAdminLoginModalOpen(true);
      return;
    }
    groups.forEach((g) => deletedGroupIdsRef.current.add(g.id));
    setGroups([]);
    setMembers([]);
    storage.saveGroups([]);
    storage.saveMembers([]);
    syncToSheetsIfConfigured(courses, [], []);
    showToast('Seluruh kelompok beserta anggotanya telah dikosongkan & disinkronkan.', 'info');
  };

  // Admin Actions: Delete multiple groups
  const handleDeleteMultipleGroups = (groupIds: string[]) => {
    if (!isAdminLoggedIn) {
      showToast('Akses ditolak: Hanya Admin/Ketua yang dapat menghapus kelompok.', 'error');
      setIsAdminLoginModalOpen(true);
      return;
    }
    groupIds.forEach((id) => deletedGroupIdsRef.current.add(id));
    const idSet = new Set(groupIds);
    const updatedGroups = groups.filter((g) => !idSet.has(g.id));
    const updatedMembers = members.filter((m) => !idSet.has(m.groupId));
    setGroups(updatedGroups);
    setMembers(updatedMembers);
    storage.saveGroups(updatedGroups);
    storage.saveMembers(updatedMembers);
    syncToSheetsIfConfigured(courses, updatedGroups, updatedMembers);
    showToast(`${groupIds.length} kelompok berhasil dihapus & disinkronkan.`, 'info');
  };

  // Admin Actions: Clear groups of a specific course
  const handleClearCourseGroups = (courseId: string) => {
    if (!isAdminLoggedIn) {
      showToast('Akses ditolak: Hanya Admin/Ketua yang dapat mengosongkan kelompok.', 'error');
      setIsAdminLoginModalOpen(true);
      return;
    }
    groups.filter((g) => g.courseId === courseId).forEach((g) => deletedGroupIdsRef.current.add(g.id));
    const updatedGroups = groups.filter((g) => g.courseId !== courseId);
    const updatedMembers = members.filter((m) => m.courseId !== courseId);
    setGroups(updatedGroups);
    setMembers(updatedMembers);
    storage.saveGroups(updatedGroups);
    storage.saveMembers(updatedMembers);
    syncToSheetsIfConfigured(courses, updatedGroups, updatedMembers);
    showToast('Seluruh kelompok pada mata kuliah ini berhasil dikosongkan.', 'info');
  };

  // Admin Actions: Save / Update Group - HANYA UNTUK ADMIN
  const handleSaveGroup = async (groupData: Partial<Group>): Promise<void> => {
    if (!isAdminLoggedIn) {
      showToast('Akses ditolak: Hanya Admin/Ketua yang dapat membuat atau mengubah kelompok.', 'error');
      setIsAdminLoginModalOpen(true);
      return;
    }

    if (groupData.id) {
      // Edit
      const updated = groups.map((g) => (g.id === groupData.id ? ({ ...g, ...groupData } as Group) : g));
      setGroups(updated);
      storage.saveGroups(updated);
      try {
        await syncToSheetsIfConfigured(courses, updated, members);
        showToast('Kelompok berhasil diperbarui & disinkronkan ke Google Sheets!', 'success');
      } catch (e) {
        console.warn('Sync error on update:', e);
        showToast('Kelompok diperbarui secara lokal. Sinkronisasi cloud akan dicoba kembali.', 'info');
      }
    } else {
      // Create new
      const newGroup: Group = {
        id: `grp-${Date.now()}`,
        courseId: groupData.courseId || courses[0]?.id || '',
        name: groupData.name || 'Kelompok Baru',
        topic: groupData.topic || '',
        description: groupData.description || '',
        maxMembers: groupData.maxMembers || 4,
        leaderName: groupData.leaderName || adminProfile.name,
        leaderWa: groupData.leaderWa || adminProfile.phone,
        status: groupData.status || 'OPEN',
        deadline: groupData.deadline || '',
        requiredSkills: groupData.requiredSkills || [],
        waGroupLink: groupData.waGroupLink || '',
        createdAt: new Date().toISOString(),
      };
      // Make sure newly added ID is not in deleted set
      deletedGroupIdsRef.current.delete(newGroup.id);

      const updated = [newGroup, ...groups];
      setGroups(updated);
      storage.saveGroups(updated);
      try {
        await syncToSheetsIfConfigured(courses, updated, members);
        showToast(`Kelompok "${newGroup.name}" berhasil dibuat & tersimpan permanen di Google Sheets!`, 'success');
      } catch (e) {
        console.warn('Sync error on create:', e);
        showToast(`Kelompok "${newGroup.name}" tersimpan secara lokal. Sinkronisasi cloud akan dicoba kembali.`, 'info');
      }
    }
  };

  // Admin Actions: Delete Group - HANYA UNTUK ADMIN
  const handleDeleteGroup = (groupId: string) => {
    if (!isAdminLoggedIn) {
      showToast('Akses ditolak: Hanya Admin/Ketua yang dapat menghapus kelompok.', 'error');
      setIsAdminLoginModalOpen(true);
      return;
    }

    deletedGroupIdsRef.current.add(groupId);
    const updatedGroups = groups.filter((g) => g.id !== groupId);
    const updatedMembers = members.filter((m) => m.groupId !== groupId);
    setGroups(updatedGroups);
    setMembers(updatedMembers);
    storage.saveGroups(updatedGroups);
    storage.saveMembers(updatedMembers);
    syncToSheetsIfConfigured(courses, updatedGroups, updatedMembers);
    showToast('Kelompok telah dihapus dari Google Sheets dan website.', 'info');
  };

  // Admin Actions: Save / Update Course
  const handleSaveCourse = (courseData: Partial<Course>) => {
    if (courseData.id) {
      const updated = courses.map((c) => (c.id === courseData.id ? ({ ...c, ...courseData } as Course) : c));
      setCourses(updated);
      syncToSheetsIfConfigured(updated, groups, members);
      showToast('Mata kuliah berhasil diperbarui & disinkronkan!', 'success');
    } else {
      const newCourse: Course = {
        id: `crs-${Date.now()}`,
        code: courseData.code || 'MATKUL',
        name: courseData.name || 'Mata Kuliah Baru',
        lecturer: courseData.lecturer || '',
        sks: courseData.sks || 3,
        semester: courseData.semester || 'Semester Ganjil 2026/2027',
        color: courseData.color || '#3b82f6',
        createdAt: new Date().toISOString(),
      };
      const updated = [...courses, newCourse];
      setCourses(updated);
      syncToSheetsIfConfigured(updated, groups, members);
      showToast(`Mata kuliah ${newCourse.name} (${newCourse.code}) berhasil ditambahkan!`, 'success');
    }
  };

  // Admin Actions: Delete Course
  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter((c) => c.id !== courseId);
    const updatedGroups = groups.filter((g) => g.courseId !== courseId);
    const updatedMembers = members.filter((m) => m.courseId !== courseId);
    setCourses(updatedCourses);
    setGroups(updatedGroups);
    setMembers(updatedMembers);
    syncToSheetsIfConfigured(updatedCourses, updatedGroups, updatedMembers);
    showToast('Mata kuliah beserta kelompok di dalamnya telah dihapus & disinkronkan.', 'info');
  };

  // Admin Actions: Delete multiple courses
  const handleDeleteMultipleCourses = (courseIds: string[]) => {
    const idSet = new Set(courseIds);
    const updatedCourses = courses.filter((c) => !idSet.has(c.id));
    const updatedGroups = groups.filter((g) => !idSet.has(g.courseId));
    const updatedMembers = members.filter((m) => !idSet.has(m.courseId));
    setCourses(updatedCourses);
    setGroups(updatedGroups);
    setMembers(updatedMembers);
    syncToSheetsIfConfigured(updatedCourses, updatedGroups, updatedMembers);
    showToast(`${courseIds.length} mata kuliah berhasil dihapus & disinkronkan.`, 'info');
  };

  // Admin Actions: Clear all courses
  const handleClearAllCourses = () => {
    setCourses([]);
    setGroups([]);
    setMembers([]);
    syncToSheetsIfConfigured([], [], []);
    showToast('Seluruh mata kuliah, kelompok, dan pendaftar telah dikosongkan & disinkronkan.', 'info');
  };

  // Sync all data to Google Sheets via Google Apps Script POST
  const handleSyncAllToSheets = async () => {
    if (!appScriptConfig.webAppUrl || !appScriptConfig.webAppUrl.trim()) {
      showToast(
        'Masukkan URL Web App Google Apps Script di tab Integrasi terlebih dahulu.',
        'error'
      );
      return;
    }

    setIsSyncing(true);
    try {
      const res = await appsScriptApi.syncAll(
        appScriptConfig.webAppUrl,
        courses,
        groups,
        members
      );

      setAppScriptConfig((prev) => ({
        ...prev,
        lastSyncStatus: 'SUCCESS',
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
        lastSyncMessage: res.message || 'Sinkronisasi berhasil!',
      }));

      showToast('Seluruh data kelompok & pendaftar berhasil disimpan ke Google Sheets!', 'success');
    } catch (error: unknown) {
      const err = error as Error;
      setAppScriptConfig((prev) => ({
        ...prev,
        lastSyncStatus: 'ERROR',
        lastSyncMessage: err.message,
      }));
      showToast(`Gagal sinkronisasi: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull latest data from Google Sheets via GET
  const handlePullFromSheets = async (silent = false) => {
    if (!appScriptConfig.webAppUrl) {
      if (!silent) showToast('URL Google Apps Script belum diisi.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await appsScriptApi.pullData(appScriptConfig.webAppUrl);
      if (res.status === 'success') {
        if (Array.isArray(res.courses) && res.courses.length > 0) {
          const normCourses = normalizeCoursesData(res.courses);
          setCourses(normCourses);
          storage.saveCourses(normCourses);
        }
        if (Array.isArray(res.groups)) {
          const normGroups = normalizeGroupsData(res.groups);
          setGroups(normGroups);
          storage.saveGroups(normGroups);
        }
        if (Array.isArray(res.members)) {
          const normMembers = normalizeMembersData(res.members);
          setMembers(normMembers);
          storage.saveMembers(normMembers);
        }

        if (!silent) {
          showToast('Data kelompok terbaru berhasil diperbarui dari Google Sheets!', 'success');
        }
      } else {
        if (!silent) showToast(res.message || 'Gagal menarik data.', 'error');
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (!silent) showToast(`Gagal menarik data: ${error.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Test connection to Google Apps Script
  const handleTestConnection = async (url: string): Promise<boolean> => {
    try {
      const res = await appsScriptApi.testConnection(url);
      return res.status === 'success';
    } catch {
      return false;
    }
  };

  // Reset all data
  const handleResetAllData = () => {
    storage.resetAllData();
    const resetCourses = storage.getCourses();
    const resetMembers = storage.getMembers();
    const resetGroups = storage.refreshGroupStatuses(storage.getGroups(), resetMembers);
    setCourses(resetCourses);
    setMembers(resetMembers);
    setGroups(resetGroups);
    setAdminProfile(storage.getAdminProfile());
    setAppScriptConfig(storage.getAppScriptConfig());
    syncToSheetsIfConfigured(resetCourses, resetGroups, resetMembers);
    showToast('Seluruh data berhasil dikembalikan ke data awal & disinkronkan!', 'success');
  };

  const pendingMembersCount = members.filter((m) => m.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-blue-950 text-blue-100 border-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'status') {
            setIsStatusModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLoginClick={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={() => {
          setIsAdminLoggedIn(false);
          setActiveTab('student');
          showToast('Berhasil keluar dari akun Admin.', 'info');
        }}
        appScriptConfig={appScriptConfig}
        onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
        onOpenSyncModal={() => {
          if (isAdminLoggedIn) {
            setActiveTab('admin');
          } else {
            setIsAppsScriptModalOpen(true);
          }
        }}
        pendingMembersCount={pendingMembersCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'student' ? (
          <StudentView
            courses={courses}
            groups={groups}
            members={members}
            onOpenJoinModal={(group) => {
              setSelectedGroupForJoin(group);
              setIsJoinModalOpen(true);
            }}
            onOpenCheckStatus={() => setIsStatusModalOpen(true)}
            onSwitchToAdmin={() => {
              if (isAdminLoggedIn) {
                setActiveTab('admin');
              } else {
                setIsAdminLoginModalOpen(true);
              }
            }}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenCreateGroup={() => {
              if (!isAdminLoggedIn) {
                setIsAdminLoginModalOpen(true);
                return;
              }
              setSelectedGroupForEdit(null);
              setIsGroupModalOpen(true);
            }}
            onOpenEditGroup={(group) => {
              if (!isAdminLoggedIn) {
                setIsAdminLoginModalOpen(true);
                return;
              }
              setSelectedGroupForEdit(group);
              setIsGroupModalOpen(true);
            }}
            onDeleteGroup={handleDeleteGroup}
            onRefreshData={() => handlePullFromSheets(false)}
            isSyncing={isSyncing}
          />
        ) : (
          <AdminDashboard
            courses={courses}
            groups={groups}
            members={members}
            appScriptConfig={appScriptConfig}
            adminProfile={adminProfile}
            onSaveAppScriptConfig={setAppScriptConfig}
            onSaveAdminProfile={setAdminProfile}
            onOpenCreateGroup={() => {
              setSelectedGroupForEdit(null);
              setIsGroupModalOpen(true);
            }}
            onOpenEditGroup={(group) => {
              setSelectedGroupForEdit(group);
              setIsGroupModalOpen(true);
            }}
            onDeleteGroup={handleDeleteGroup}
            onDeleteMultipleGroups={handleDeleteMultipleGroups}
            onClearAllGroups={handleClearAllGroups}
            onClearGroupMembers={handleClearGroupMembers}
            onOpenCreateCourse={() => {
              setSelectedCourseForEdit(null);
              setIsCourseModalOpen(true);
            }}
            onOpenEditCourse={(course) => {
              setSelectedCourseForEdit(course);
              setIsCourseModalOpen(true);
            }}
            onDeleteCourse={handleDeleteCourse}
            onDeleteMultipleCourses={handleDeleteMultipleCourses}
            onClearAllCourses={handleClearAllCourses}
            onClearCourseGroups={handleClearCourseGroups}
            onApproveMember={handleApproveMember}
            onRejectMember={handleRejectMember}
            onDeleteMember={handleDeleteMember}
            onDeleteMultipleMembers={handleDeleteMultipleMembers}
            onClearAllMembers={handleClearAllMembers}
            onSyncAllToSheets={handleSyncAllToSheets}
            onPullFromSheets={handlePullFromSheets}
            onTestConnection={handleTestConnection}
            onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
            onResetAllData={handleResetAllData}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Dedicated Modern Footer */}
      <Footer
        onNavigateToStudent={() => setActiveTab('student')}
        onOpenCheckStatus={() => setIsStatusModalOpen(true)}
        onOpenAdminLogin={() => {
          if (isAdminLoggedIn) {
            setActiveTab('admin');
          } else {
            setIsAdminLoginModalOpen(true);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
      />

      {/* MODALS */}
      {selectedGroupForJoin && (
        <JoinGroupModal
          group={selectedGroupForJoin}
          course={courses.find((c) => c.id === selectedGroupForJoin.courseId)}
          isOpen={isJoinModalOpen}
          onClose={() => {
            setIsJoinModalOpen(false);
            setSelectedGroupForJoin(null);
          }}
          onSubmit={handleRegisterMember}
        />
      )}

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        correctPin={adminProfile.pin}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminLoginModalOpen(false);
          setActiveTab('admin');
          showToast(`Selamat datang kembali, ${adminProfile.name}!`, 'success');
        }}
      />

      {isGroupModalOpen && (
        <GroupManagerModal
          key={selectedGroupForEdit ? selectedGroupForEdit.id : 'new-group'}
          isOpen={isGroupModalOpen}
          onClose={() => {
            setIsGroupModalOpen(false);
            setSelectedGroupForEdit(null);
          }}
          onSave={handleSaveGroup}
          courses={courses}
          initialData={selectedGroupForEdit}
          defaultAdminName={adminProfile.name}
          defaultAdminWa={adminProfile.phone}
          members={members}
          onDeleteMember={handleDeleteMember}
          onClearGroupMembers={handleClearGroupMembers}
        />
      )}

      {isCourseModalOpen && (
        <CourseManagerModal
          key={selectedCourseForEdit ? selectedCourseForEdit.id : 'new-course'}
          isOpen={isCourseModalOpen}
          onClose={() => {
            setIsCourseModalOpen(false);
            setSelectedCourseForEdit(null);
          }}
          onSave={handleSaveCourse}
          initialData={selectedCourseForEdit}
        />
      )}

      <RegistrationStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        courses={courses}
        groups={groups}
        members={members}
      />

      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        onOpenSettings={() => {
          if (!isAdminLoggedIn) {
            setIsAdminLoginModalOpen(true);
          } else {
            setActiveTab('admin');
          }
        }}
      />
    </div>
  );
}
