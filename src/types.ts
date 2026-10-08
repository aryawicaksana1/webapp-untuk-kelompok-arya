export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer?: string;
  sks: number;
  semester: string;
  color?: string;
  createdAt: string;
}

export type GroupStatus = 'OPEN' | 'FULL' | 'CLOSED';

export interface Group {
  id: string;
  courseId: string;
  name: string;
  topic: string;
  description: string;
  maxMembers: number; // ditentukan oleh admin
  leaderName: string;
  leaderWa: string;
  status: GroupStatus;
  deadline: string;
  requiredSkills: string[];
  waGroupLink?: string; // Link undangan grup WA
  createdAt: string;
}

export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Member {
  id: string;
  groupId: string;
  courseId: string;
  name: string;
  nim: string;
  whatsapp: string;
  email: string;
  role: string;
  skills: string;
  commitment: string;
  status: MemberStatus;
  registeredAt: string;
  notes?: string;
}

export interface AppScriptConfig {
  webAppUrl: string;
  spreadsheetUrl: string;
  autoSync: boolean;
  lastSyncTime?: string;
  lastSyncStatus?: 'SUCCESS' | 'ERROR' | 'IDLE';
  lastSyncMessage?: string;
}

export interface AdminProfile {
  name: string;
  pin: string;
  email: string;
  phone: string;
}
