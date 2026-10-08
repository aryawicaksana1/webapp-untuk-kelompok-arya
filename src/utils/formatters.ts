import { Group, Member } from '../types';

/**
 * Format nomor WhatsApp ke format internasional (628xxx)
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generate link WhatsApp langsung dengan pesan
 */
export function getWhatsAppChatUrl(phone: string, text: string): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  if (!formattedPhone) return '#';
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Format tanggal Indonesia ramah pengguna
 */
export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Hitung statistik kuota kelompok
 */
export function getGroupStats(group: Group, allMembers: Member[]) {
  const groupMembers = allMembers.filter((m) => m.groupId === group.id);
  const approvedMembers = groupMembers.filter((m) => m.status === 'APPROVED');
  const pendingMembers = groupMembers.filter((m) => m.status === 'PENDING');
  const rejectedMembers = groupMembers.filter((m) => m.status === 'REJECTED');

  const filledCount = approvedMembers.length;
  const max = group.maxMembers || 1;
  const isFull = filledCount >= max || group.status === 'FULL';
  const remainingSlots = Math.max(0, max - filledCount);
  const percentage = Math.min(100, Math.round((filledCount / max) * 100));

  return {
    groupMembers,
    approvedMembers,
    pendingMembers,
    rejectedMembers,
    filledCount,
    max,
    isFull,
    remainingSlots,
    percentage,
  };
}
