import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/appsScriptCode';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<'tutorial' | 'code'>('tutorial');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Kode Google Apps Script & Integrasi Google Sheets
              </h2>
              <p className="text-xs text-slate-500">
                Salin kode ini ke Google Apps Script Spreadsheet Anda untuk sinkronisasi otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStepTab('tutorial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeStepTab === 'tutorial'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📖 Panduan Pemasangan (Langkah demi Langkah)
            </button>
            <button
              onClick={() => setActiveStepTab('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeStepTab === 'code'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              💻 Kode Sumber Apps Script (Code.gs)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Seluruh Kode</span>
              </>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
          {activeStepTab === 'tutorial' ? (
            <div className="space-y-6">
              {/* Alert notice */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">Gratis 100% & Tanpa Batas Kuota Server</p>
                  <p className="text-indigo-800 leading-relaxed">
                    Dengan Google Apps Script, Google Spreadsheet Anda bertindak sebagai REST API database langsung.
                    Data pendaftaran kelompok kuliah akan langsung tercatat rapi di Google Drive Anda.
                  </p>
                </div>
              </div>

              {/* Step cards */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <h4 className="font-bold text-sm text-slate-900">Buat Google Spreadsheet Baru</h4>
                    <p>
                      Buka Google Drive atau ketik{' '}
                      <a
                        href="https://sheets.new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold underline inline-flex items-center gap-0.5"
                      >
                        sheets.new <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      di browser Anda. Beri nama file, misalnya:{' '}
                      <span className="font-semibold text-slate-800">&quot;Database Kelompok Kuliah 2026&quot;</span>.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <h4 className="font-bold text-sm text-slate-900">Buka Ekstensi &gt; Apps Script</h4>
                    <p>
                      Di bilah menu atas Google Sheets, klik menu <span className="font-semibold text-slate-800">Extensions (Ekstensi)</span> lalu pilih <span className="font-semibold text-slate-800">Apps Script</span>. Tab editor skrip baru akan terbuka.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <h4 className="font-bold text-sm text-slate-900">Tempelkan Kode &amp; Jalankan Setup</h4>
                    <p>
                      Hapus semua kode bawaan di file <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Code.gs</code>, lalu tempelkan kode yang ada di tab <strong>&ldquo;Kode Sumber Apps Script&rdquo;</strong> (atau klik tombol Salin di kanan atas).
                    </p>
                    <p className="text-slate-500">
                      Simpan file (Ctrl+S / Cmd+S). Setelah itu, di dropdown fungsi sebelah tombol &ldquo;Run&rdquo;, pilih fungsi <code className="bg-slate-100 px-1 rounded font-mono font-bold text-blue-700">setupSpreadsheet</code> lalu klik tombol <strong>Run (Jalankan)</strong> sekali untuk membuat 3 tab: <span className="font-semibold">Mata_Kuliah</span>, <span className="font-semibold">Kelompok</span>, dan <span className="font-semibold">Anggota</span> secara otomatis dengan warna rapi!
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <h4 className="font-bold text-sm text-slate-900">Deploy sebagai Web App (PENTING!)</h4>
                    <p>Klik tombol biru di pojok kanan atas: <strong className="text-slate-900">Deploy (Terapkan) &gt; New deployment (Penerapan baru)</strong>.</p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px] text-slate-700">
                      <div>⚙️ Select type: <strong>Web app</strong> (ikon roda gigi)</div>
                      <div>👤 Execute as: <strong>Me (Saya)</strong></div>
                      <div>🌐 Who has access: <strong className="text-rose-600">Anyone (Siapa saja)</strong> &larr; WAJIB!</div>
                    </div>
                    <p className="text-slate-500">
                      Klik <strong>Deploy</strong>. Jika muncul jendela otorisasi akun Google Anda, klik <em>Advanced / Lanjutan</em> &gt; <em>Go to TemanKelompok (unsafe)</em> &gt; <em>Allow</em>.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <h4 className="font-bold text-sm text-slate-900">Salin Web App URL ke Webapp Ini</h4>
                    <p>
                      Salin URL yang diberikan Google (berakhiran <code className="bg-slate-100 px-1 rounded font-mono">/exec</code>), lalu buka menu Pengaturan Integrasi di webapp ini dan tempelkan.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSettings();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                    >
                      <span>Buka Pengaturan Integrasi Google Sheets</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">File: Code.gs (Google Apps Script)</span>
                <span>Ukuran: ~5.8 KB</span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 text-xs font-mono">
                <div className="p-4 max-h-[500px] overflow-y-auto leading-relaxed select-all">
                  <pre className="whitespace-pre">{GOOGLE_APPS_SCRIPT_CODE}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Kode ke Clipboard</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
