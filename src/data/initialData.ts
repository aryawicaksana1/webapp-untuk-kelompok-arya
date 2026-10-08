import { Course, Group, Member, AdminProfile, AppScriptConfig } from '../types';

export const INITIAL_ADMIN_PROFILE: AdminProfile = {
  name: 'Gus Arya Wicaksana (Admin/Ketua)',
  pin: 'AryaWicak191207',
  email: 'gusaryawicaksana3@gmail.com',
  phone: '+62 813-5374-6248',
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-bing',
    code: 'BING101',
    name: 'Bahasa Inggris',
    lecturer: '',
    sks: 2,
    semester: 'Semester Ganjil 2026/2027',
    color: '#2563eb', // Blue
    createdAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'crs-mattek',
    code: 'MATE102',
    name: 'Matematika Teknik',
    lecturer: '',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
    color: '#7c3aed', // Purple
    createdAt: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'crs-alpro',
    code: 'ALPR103',
    name: 'Algoritma dan Pemrograman',
    lecturer: '',
    sks: 4,
    semester: 'Semester Ganjil 2026/2027',
    color: '#059669', // Emerald
    createdAt: '2026-09-11T09:00:00.000Z',
  },
  {
    id: 'crs-komas',
    code: 'KOMS104',
    name: 'Komputer dan Masyarakat',
    lecturer: '',
    sks: 2,
    semester: 'Semester Ganjil 2026/2027',
    color: '#d97706', // Amber
    createdAt: '2026-09-11T10:00:00.000Z',
  },
  {
    id: 'crs-statprob',
    code: 'STAT105',
    name: 'Statistika dan Probabilitas',
    lecturer: '',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
    color: '#dc2626', // Red
    createdAt: '2026-09-12T11:00:00.000Z',
  },
  {
    id: 'crs-sisdig',
    code: 'SISD106',
    name: 'Sistem Digital',
    lecturer: '',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
    color: '#0284c7', // Sky
    createdAt: '2026-09-12T13:00:00.000Z',
  },
  {
    id: 'crs-pancasila',
    code: 'PANC107',
    name: 'Pancasila',
    lecturer: '',
    sks: 2,
    semester: 'Semester Ganjil 2026/2027',
    color: '#e11d48', // Rose
    createdAt: '2026-09-13T14:00:00.000Z',
  },
];

export const INITIAL_GROUPS: Group[] = [];

export const INITIAL_MEMBERS: Member[] = [];

export const PERMANENT_APPSCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyWo5q5x5G59a79BQMXInyFvB1tuEAiuXGH5ycksPjsv0ww7AyZpzJ5fwLkib0xywKBrg/exec';

export const INITIAL_APPSCRIPT_CONFIG: AppScriptConfig = {
  webAppUrl: PERMANENT_APPSCRIPT_URL,
  spreadsheetUrl: '',
  autoSync: true,
  lastSyncStatus: 'IDLE',
  lastSyncMessage: 'Google Apps Script terhubung secara permanen.',
};
