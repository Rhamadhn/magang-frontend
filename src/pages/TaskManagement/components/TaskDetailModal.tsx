import React, { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { CalendarEvent, Logbook } from "../types";

// Menggunakan icon yang tersedia di folder icons
import { 
  InfoIcon, 
  UserIcon, 
  CalenderIcon, 
  DownloadIcon 
} from "../../../icons";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CalendarEvent | null;
  allLogbooks: Logbook[];
  onVerifyTask: (id: string, data: { status: string; catatan: string }) => void;
  onVerifyLogbook: (id: string, data: { status: string; catatan: string }) => void;
}

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  disetujui: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  revisi: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  allLogbooks,
  onVerifyTask,
  onVerifyLogbook
}) => {
  const [mentorNotes, setMentorNotes] = useState<Record<string, string>>({});

  if (!task) return null;

  // 1. Ekstraksi ID Tugas secara aman
  const targetTaskId = task.id || task.extendedProps?.dbId || task.extendedProps?.id;

  // 2. Filter & Sort data logbook (Urutan otomatis: Terbaru ke Terlama di bagian atas)
  const relatedLogs = allLogbooks
    .filter((log) => {
      if (!log.tugas_id || !targetTaskId) return false;
      const cleanLogTugasId = String(log.tugas_id).replace("task-", "").toLowerCase();
      const cleanTargetTaskId = String(targetTaskId).replace("task-", "").toLowerCase();
      return cleanLogTugasId === cleanTargetTaskId;
    })
    .sort((a, b) => {
      return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    });

  // 3. Memisahkan berkas progres dan logbook harian biasa
  const taskSubmissions = relatedLogs.filter(log => log.link_progres || log.file_path);
  const dailyLogbooks = relatedLogs.filter(log => !log.link_progres && !log.file_path);

  const handleNoteChange = (id: string, value: string) => {
    setMentorNotes(prev => ({ ...prev, [id]: value }));
  };

  const checkStatus = (statusStr: string) => {
    if (!statusStr) return { isPending: true, isSuccess: false, isRevisi: false };
    const lower = statusStr.toLowerCase();
    
    const isSuccess = lower.includes('disetujui') || lower.includes('success') || lower.includes('approved');
    const isRevisi = lower.includes('revisi') || lower.includes('revision');
    const isPending = lower.includes('pending') || (!isSuccess && !isRevisi);

    return { isPending, isSuccess, isRevisi };
  };

  const cleanStatusText = (statusStr: string) => {
    if (!statusStr) return 'PENDING';
    const lower = statusStr.toLowerCase();
    if (lower.includes('disetujui')) return 'APPROVED';
    if (lower.includes('revisi')) return 'REVISION';
    return 'PENDING';
  };

  const renderFormattedDate = (dateStr: string) => {
    if (!dateStr) return "-";
    
    let cleanDateStr = dateStr;
    if (dateStr.includes('-') && !dateStr.includes('T')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 2) { 
        cleanDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const d = new Date(cleanDateStr);
    return isNaN(d.getTime()) 
      ? dateStr 
      : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-[1100px] w-full p-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-gray-900 h-full lg:h-[85vh]">
        
        {/* ================= PANEL KIRI: SPESIFIKASI & INSTRUKSI TUGAS ================= */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.005] p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center shrink-0">
                  <InfoIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Detail Tugas</h3>
                  <p className="text-[9px] font-mono text-gray-400 tracking-tight">
                    ID Tugas: {String(targetTaskId).replace("task-", "")}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${statusBadge[task.extendedProps?.status] || statusBadge.pending}`}>
                {task.extendedProps?.status || 'pending'}
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug tracking-tight">
                {task.title ? task.title.replace("Task: ", "") : "Tugas Tanpa Judul"}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5 rounded-xl shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nama Peserta Magang</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    {task.extendedProps?.intern_name || "Nama tidak tersedia"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Batas Waktu</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                    <CalenderIcon className="w-3.5 h-3.5 text-red-400" />
                    {task.end ? renderFormattedDate(task.end) : "Tanpa Deadline"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instruksi Kerja Mentor</h5>
              <div className="p-4 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                {task.extendedProps?.description || "Tidak ada deskripsi instruksi tambahan."}
              </div>
            </div>
          </div>

          <div className="pt-6 hidden lg:block border-t border-t-gray-100 dark:border-t-gray-800">
            <Button variant="outline" size="sm" onClick={onClose} className="w-full text-xs font-semibold rounded-xl">
              Tutup Detail Panel
            </Button>
          </div>
        </div>

        {/* ================= PANEL KANAN: LIST PENGUMPULAN & LOGBOOK AKTIVITAS ================= */}
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col overflow-hidden h-full bg-white dark:bg-gray-900">
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
            
            {/* ---------------- SEKSI 1: PENGUMPULAN TUGAS ---------------- */}
            <div>
              <div className="pb-2 mb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight uppercase">Pengumpulan Tugas Peserta Magang</h5>
                  <p className="text-[11px] text-gray-400">Berkas hasil kerja dan tautan progres pengerjaan peserta magang.</p>
                </div>
                <span className="text-xs px-2.5 py-0.5 pr-12 font-bold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                  {taskSubmissions.length} Berkas
                </span>
              </div>

              <div className="space-y-4">
                {taskSubmissions.length > 0 ? (
                  taskSubmissions.map((log) => {
                    const { isPending, isSuccess, isRevisi } = checkStatus(log.status);

                    return (
                      <div key={log.id} className="p-4 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-gray-800/80 space-y-3">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <CalenderIcon className="w-3 h-3 text-gray-400" />
                            Dikirim: {renderFormattedDate(log.tanggal)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            isSuccess ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : isRevisi ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}>
                            {cleanStatusText(log.status)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          <span className="text-gray-400 text-[11px] block font-normal mb-1">Catatan Peserta Magang:</span>
                          "{log.aktivitas}"
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {log.link_progres && (
                            <a href={log.link_progres} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-bold hover:bg-gray-50 transition-all shadow-sm">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              LIHAT LINK PENGUMPULAN
                            </a>
                          )}
                          {log.file_path && (
                            <a href={`http://localhost:8000/storage/${log.file_path}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-bold hover:bg-gray-50 transition-all shadow-sm">
                              <DownloadIcon className="w-3 h-3 text-indigo-500" />
                              DOWNLOAD DOKUMEN
                            </a>
                          )}
                        </div>

                        {log.catatan_mentor && (
                          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border-l-2 border-amber-500 dark:border-amber-400 shadow-sm text-xs mt-2">
                            <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-0.5">Catatan/Feedback Mentor:</p>
                            <p className="text-gray-600 dark:text-gray-400 italic">"{log.catatan_mentor}"</p>
                          </div>
                        )}

                        {isPending && (
                          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                            <textarea 
                              placeholder="Ketik feedback revisi atau catatan persetujuan di sini..."
                              className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-brand-500 outline-none resize-none text-gray-700 dark:text-gray-200"
                              rows={2}
                              value={mentorNotes[log.id] || ""}
                              onChange={(e) => handleNoteChange(log.id, e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerifyTask(log.id, { status: 'revisi', catatan: mentorNotes[log.id] || 'Perlu perbaikan' });
                                }}
                                className="flex-1 py-1.5 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-50 rounded-xl text-[10px] font-bold transition-all"
                              >
                                REVISI TUGAS
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerifyTask(log.id, { status: 'disetujui', catatan: mentorNotes[log.id] || 'Oke' });
                                }}
                                className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all"
                              >
                                SETUJUI TUGAS
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-400 italic">Belum ada file atau link tugas yang dikumpulkan.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ---------------- SEKSI 2: RIWAYAT LOGBOOK HARIAN ---------------- */}
            <div>
              <div className="pb-2 mb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight uppercase">Logbook Aktivitas Harian</h5>
                  <p className="text-[11px] text-gray-400">Catatan harian koordinasi aktivitas tanpa pengiriman berkas fisik.</p>
                </div>
                <span className="text-xs px-2.5 py-0.5 pr-12 font-bold rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10">
                  {dailyLogbooks.length} Laporan
                </span>
              </div>

              <div className="space-y-3">
                {dailyLogbooks.length > 0 ? (
                  dailyLogbooks.map((log) => {
                    const { isPending, isSuccess, isRevisi } = checkStatus(log.status);

                    return (
                      <div key={log.id} className="p-3.5 rounded-xl bg-gray-50/30 dark:bg-white/[0.005] border border-gray-100 dark:border-gray-800/50 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <CalenderIcon className="w-3 h-3 text-gray-400" />
                            Dilaporkan: {renderFormattedDate(log.tanggal)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            isSuccess ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : isRevisi ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'
                          }`}>
                            {cleanStatusText(log.status)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-normal leading-relaxed">
                          {log.aktivitas}
                        </p>
                        
                        {log.catatan_mentor && (
                          <div className="p-2.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900 text-[11px] italic text-amber-700 dark:text-amber-400 mt-1">
                            <span className="font-bold uppercase text-[9px] block not-italic mb-0.5">Catatan Mentor:</span>
                            "{log.catatan_mentor}"
                          </div>
                        )}
                        
                        {isPending && (
                          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => onVerifyLogbook(log.id, { status: 'revisi', catatan: 'Perlu revisi aktivitas' })}
                              className="px-3 py-1 text-[9px] font-bold border border-red-200 text-red-600 bg-white dark:bg-gray-800 rounded-lg hover:bg-red-50 transition-all"
                            >
                              REVISI LOGBOOK
                            </button>
                            <button
                              type="button"
                              onClick={() => onVerifyLogbook(log.id, { status: 'disetujui', catatan: 'Oke' })}
                              className="px-3 py-1 text-[9px] font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all"
                            >
                              SETUJUI LOGBOOK
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-400 italic">Tidak ada catatan aktivitas harian tanpa berkas.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end lg:hidden shrink-0">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold rounded-xl">
              Tutup Panel
            </Button>
          </div>

        </div>
      </div>
    </Modal>
  );
};