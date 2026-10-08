import React, { useState, useEffect } from 'react';
import { X, BookOpen, User, Hash, AlertCircle } from 'lucide-react';
import { Course } from '../types';

interface CourseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Partial<Course>) => void;
  initialData?: Course | null;
}

const PRESET_COLORS = [
  { label: 'Biru', value: '#3b82f6' },
  { label: 'Ungu', value: '#8b5cf6' },
  { label: 'Hijau', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Cyan', value: '#06b6d4' },
];

export const CourseManagerModal: React.FC<CourseManagerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [code, setCode] = useState<string>(() => initialData?.code || '');
  const [name, setName] = useState<string>(() => initialData?.name || '');
  const [sks, setSks] = useState<number>(() => initialData?.sks || 3);
  const [semester, setSemester] = useState<string>(() => initialData?.semester || 'Semester Ganjil 2026/2027');
  const [color, setColor] = useState<string>(() => initialData?.color || '#3b82f6');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Kode mata kuliah wajib diisi (contoh: IF3201).');
      return;
    }
    if (!name.trim()) {
      setError('Nama mata kuliah wajib diisi.');
      return;
    }

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      lecturer: '',
      sks: Number(sks),
      semester: semester.trim(),
      color,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Kelola daftar mata kuliah yang membutuhkan pembentukan kelompok.
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
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Kode & SKS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-blue-600" />
                  Kode Matkul <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="IF3201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jumlah SKS
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={sks}
                  onChange={(e) => setSks(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center font-bold"
                />
              </div>
            </div>

            {/* Nama Mata Kuliah */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Nama Mata Kuliah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pemrograman Web Lanjut"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester / Tahun Ajaran
              </label>
              <input
                type="text"
                placeholder="Semester Ganjil 2026/2027"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Warna Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Warna Aksen Label
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c.value ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
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
            form="course-form"
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            {isEditing ? 'Simpan Perubahan' : 'Tambah Matkul'}
          </button>
        </div>
      </div>
    </div>
  );
};
