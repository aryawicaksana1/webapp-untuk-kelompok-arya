import { Course, Group, Member, AdminProfile, AppScriptConfig } from '../types';
import {
  INITIAL_COURSES,
  INITIAL_GROUPS,
  INITIAL_MEMBERS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_APPSCRIPT_CONFIG,
  PERMANENT_APPSCRIPT_URL,
} from '../data/initialData';

const STORAGE_KEYS = {
  COURSES: 'teman_kelompok_courses_v1',
  GROUPS: 'teman_kelompok_groups_v3',
  MEMBERS: 'teman_kelompok_members_v3',
  ADMIN_PROFILE: 'teman_kelompok_admin_profile_v1',
  APPSCRIPT_CONFIG: 'teman_kelompok_appscript_config_v1',
  ADMIN_AUTH: 'teman_kelompok_admin_auth_session_v1',
};

export const storage = {
  getCourses(): Course[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (data === null) return INITIAL_COURSES;
      const parsed: Course[] = JSON.parse(data);
      // Migrate if old sample courses detected
      const hasOldCourse = parsed.some((c) => c.id === 'crs-1' || c.name === 'Pemrograman Web Lanjut');
      if (hasOldCourse) {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return parsed.map((c) => ({
        ...c,
        lecturer: '',
      }));
    } catch {
      return INITIAL_COURSES;
    }
  },

  saveCourses(courses: Course[]): void {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  getGroups(): Group[] {
    try {
      // Clean up old legacy keys to guarantee website starts with no groups
      ['teman_kelompok_groups_v2', 'teman_kelompok_groups_v1', 'teman_kelompok_groups'].forEach((k) => {
        if (localStorage.getItem(k) !== null) localStorage.removeItem(k);
      });

      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (data === null) {
        // When opening the website for the first time, there are NO groups
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify([]));
        return [];
      }
      const parsed: Group[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  },

  saveGroups(groups: Group[]): void {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  getMembers(): Member[] {
    try {
      ['teman_kelompok_members_v2', 'teman_kelompok_members_v1', 'teman_kelompok_members'].forEach((k) => {
        if (localStorage.getItem(k) !== null) localStorage.removeItem(k);
      });

      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (data === null) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
        return [];
      }
      const parsed: Member[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  },

  saveMembers(members: Member[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },

  getAdminProfile(): AdminProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_PROFILE);
      if (!data) return INITIAL_ADMIN_PROFILE;
      const parsed: AdminProfile = JSON.parse(data);
      if (parsed.pin === 'admin123') {
        parsed.pin = INITIAL_ADMIN_PROFILE.pin;
      }
      if (parsed.phone === '081234567890') {
        parsed.phone = INITIAL_ADMIN_PROFILE.phone;
      }
      return parsed;
    } catch {
      return INITIAL_ADMIN_PROFILE;
    }
  },

  saveAdminProfile(profile: AdminProfile): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(profile));
  },

  getAppScriptConfig(): AppScriptConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPSCRIPT_CONFIG);
      if (!data) return INITIAL_APPSCRIPT_CONFIG;
      const parsed: AppScriptConfig = JSON.parse(data);
      // Ensure the permanent URL is always applied
      if (!parsed.webAppUrl || parsed.webAppUrl !== PERMANENT_APPSCRIPT_URL) {
        parsed.webAppUrl = PERMANENT_APPSCRIPT_URL;
        parsed.autoSync = true;
        localStorage.setItem(STORAGE_KEYS.APPSCRIPT_CONFIG, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_APPSCRIPT_CONFIG;
    }
  },

  saveAppScriptConfig(config: AppScriptConfig): void {
    localStorage.setItem(STORAGE_KEYS.APPSCRIPT_CONFIG, JSON.stringify(config));
  },

  isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminLoggedIn(value: boolean): void {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  },

  // Helper to recompute group filled member counts & auto-manage FULL status
  refreshGroupStatuses(groups: Group[], members: Member[]): Group[] {
    const approvedCounts: Record<string, number> = {};
    members.forEach((m) => {
      if (m.status === 'APPROVED') {
        approvedCounts[m.groupId] = (approvedCounts[m.groupId] || 0) + 1;
      }
    });

    return groups.map((g) => {
      const filled = approvedCounts[g.id] || 0;
      let newStatus = g.status;
      if (g.status !== 'CLOSED') {
        if (filled >= g.maxMembers) {
          newStatus = 'FULL';
        } else {
          newStatus = 'OPEN';
        }
      }
      return { ...g, status: newStatus };
    });
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.APPSCRIPT_CONFIG);
    [
      'teman_kelompok_groups_v3',
      'teman_kelompok_groups_v2',
      'teman_kelompok_groups_v1',
      'teman_kelompok_groups',
      'teman_kelompok_members_v3',
      'teman_kelompok_members_v2',
      'teman_kelompok_members_v1',
      'teman_kelompok_members',
    ].forEach((k) => {
      localStorage.removeItem(k);
    });
  },
};
