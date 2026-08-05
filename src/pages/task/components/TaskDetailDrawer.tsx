import React, { useState, useEffect } from 'react';
import { taskService } from '../../../api/taskService';
import { Task } from '../TaskPage';
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";

// Menggunakan koleksi icon bawaan template agar konsisten secara visual
import { 
  CloseIcon, 
  InfoIcon, 
  AlertIcon, 
  PaperPlaneIcon, 
  LockIcon,
  FileIcon
} from "../../../icons"; 

interface DrawerProps {
  isOpen: boolean;
  taskId: string | number | null;
  onClose: () => void;
  onRefresh: () => void;
}

const TaskDetailDrawer: React.FC<DrawerProps> = ({ isOpen, taskId, onClose, onRefresh }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [linkProgres, setLinkProgres] = useState<string>('');
  const [fileTugas, setFileTugas] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && taskId) {
      const loadDetail = async () => {
        setLoading(true);
        try {
          const response = await taskService.getTugasDetail(taskId);
          if (response.data && response.data.success) {
            setTask(response.data.data);
          }
        } catch (err) {
          console.error("Gagal memuat detail tugas", err);
        } finally {
          setLoading(false);
        }
      };
      loadDetail();
    } else {
      setTask(null);
      setLinkProgres('');
      setFileTugas(null);
    }
  }, [isOpen, taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tugas_id', taskId.toString());
      formData.append('link_progres', linkProgres);
      formData.append('aktivitas', `Mengumpulkan tugas pengerjaan proyek: ${task?.judul_tugas}`);
      formData.append('tanggal', new Date().toISOString().split('T')[0]);

      if (fileTugas) {
        formData.append('file_tugas', fileTugas);
      }

      const res = await taskService.submitTugas(formData);
      if (res.data) {
        onRefresh(); 
        onClose();   
      }
    } catch (error) {
      console.error("Gagal mengirimkan tugas:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-[650px] w-full p-8 transition-all"
    >
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-5 mb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
            <InfoIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Tugas Intern</h3>
            <p className="text-xs text-gray-500">Periksa rincian tugas dan kirimkan hasil laporan perkembangan.</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Konten Tengah */}
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 scrollbar-thin">
        {loading ? (
          <div className="py-12 text-center text-xs font-medium text-gray-500 animate-pulse">
            Memuat detail informasi tugas dari server...
          </div>
        ) : task ? (
          <>
            {/* Informasi & Deskripsi Tugas */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-gray-800 dark:text-white">{task.judul_tugas}</h4>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {task.deskripsi}
              </div>
            </div>

            {/* Catatan Revisi Mentor */}
            {task.status === 'revisi' && task.catatan_mentor && (
              <div className="p-4 bg-red-50/60 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-xl flex items-start gap-3">
                <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <h5 className="font-bold text-red-700 dark:text-red-300 uppercase tracking-wider text-[10px] mb-1">Catatan Revisi Mentor:</h5>
                  <p className="text-red-600 dark:text-red-400 font-medium">"{task.catatan_mentor}"</p>
                </div>
              </div>
            )}

            {/* 🛠️ PERBAIKAN LOGIK: Izinkan status 'ongoing' untuk melakukan submit tugas */}
            {task.status === 'todo' || task.status === 'ongoing' || task.status === 'revisi' ? (
              <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-5">
                <h5 className="font-bold text-gray-800 dark:text-white text-xs uppercase tracking-wider text-brand-500">
                  Formulir Pengumpulan Hasil Kerja
                </h5>
                
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Link Progress Kerja (GitHub / URL Proyek) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/project"
                    value={linkProgres}
                    onChange={(e) => setLinkProgres(e.target.value)}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl text-xs outline-none focus:border-brand-500 transition-all text-gray-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Unggah File Lampiran (ZIP / PDF jika diperlukan)
                  </label>
                  <div className="relative flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50/50 dark:bg-white/[0.01] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-3">
                        <FileIcon className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          {fileTugas ? fileTugas.name : 'Pilih dokumen atau drag file ke sini'}
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={(e) => setFileTugas(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="outline" type="button" onClick={onClose}>
                    Batalkan
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    <PaperPlaneIcon className="w-4 h-4" />
                    {submitting ? 'Sedang Mengirim...' : 'Kirim Hasil Tugas'}
                  </Button>
                </div>
              </form>
            ) : (
              /* State Terkunci untuk Review / Selesai */
              <div className="p-5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3 text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                <LockIcon className="w-5 h-5 text-gray-400 shrink-0" />
                <span>
                  {task.status === 'review' 
                    ? 'Tugas ini telah dikirim dan saat ini dalam antrean penilaian mentor bimbingan kamu.' 
                    : 'Tugas ini telah diverifikasi penuh (Selesai). Akses pengumpulan ulang ditutup.'
                  }
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-xs font-medium text-gray-400">
            Data gagal diurai atau tidak ditemukan.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailDrawer;