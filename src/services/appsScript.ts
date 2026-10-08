import { Course, Group, Member } from '../types';

export interface AppsScriptResponse {
  status: 'success' | 'error';
  message: string;
  courses?: Course[];
  groups?: Group[];
  members?: Member[];
  spreadsheetName?: string;
  syncedAt?: string;
  [key: string]: unknown;
}

export const appsScriptApi = {
  /**
   * Mengirim POST ke Google Apps Script tanpa CORS preflight issue
   * Menggunakan Content-Type: text/plain agar browser tidak mengirim OPTIONS preflight
   */
  async sendPost(url: string, payload: Record<string, unknown>): Promise<AppsScriptResponse> {
    if (!url || !url.trim().startsWith('http')) {
      throw new Error('URL Google Apps Script tidak valid.');
    }

    try {
      const response = await fetch(url.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const err = error as Error;
      // Berikan penanganan ramah bila ada CORS atau network error
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error(
          'Gagal menghubungi Google Apps Script. Pastikan Web App di-deploy dengan akses "Who has access: Anyone" dan URL berakhiran /exec.'
        );
      }
      throw err;
    }
  },

  /**
   * Tes koneksi ke Google Apps Script Web App
   */
  async testConnection(url: string): Promise<AppsScriptResponse> {
    return this.sendPost(url, { action: 'testConnection' });
  },

  /**
   * Sinkronisasi seluruh data lokal ke Google Sheets (Kelompok, Anggota, Matkul)
   */
  async syncAll(
    url: string,
    courses: Course[],
    groups: Group[],
    members: Member[]
  ): Promise<AppsScriptResponse> {
    return this.sendPost(url, {
      action: 'syncAll',
      courses,
      groups,
      members,
    });
  },

  /**
   * Kirim pendaftaran anggota baru ke Google Sheets
   */
  async registerMember(url: string, member: Member): Promise<AppsScriptResponse> {
    return this.sendPost(url, {
      action: 'registerMember',
      member,
    });
  },

  /**
   * Update status verifikasi anggota di Google Sheets
   */
  async updateMemberStatus(
    url: string,
    memberId: string,
    newStatus: string,
    notes?: string
  ): Promise<AppsScriptResponse> {
    return this.sendPost(url, {
      action: 'updateMemberStatus',
      memberId,
      newStatus,
      notes,
    });
  },

  /**
   * Tarik data terbaru dari Google Sheets (GET request)
   */
  async pullData(url: string): Promise<AppsScriptResponse> {
    if (!url || !url.trim().startsWith('http')) {
      throw new Error('URL Google Apps Script tidak valid.');
    }

    try {
      const response = await fetch(url.trim(), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error(
          'Gagal mengambil data dari Google Apps Script. Pastikan Web App di-deploy dengan akses "Who has access: Anyone".'
        );
      }
      throw err;
    }
  },
};
