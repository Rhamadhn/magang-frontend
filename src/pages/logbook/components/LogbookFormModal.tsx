import React, { useState, useEffect } from "react";
import { taskService } from "../../../api/taskService";
import { logbookService } from "../../../api/logbookService";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";

import { 
  CloseIcon, 
  InfoIcon, 
  PaperPlaneIcon 
} from "../../../icons"; 

interface LogbookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void; // Ditambahkan parameter pesan
  onError: (title: string, message: string) => void; // Properti baru untuk handle error template
}

interface TaskOption {
  value: string;
  label: string;
}

export default function LogbookFormModal({ isOpen, onClose, onSuccess, onError }: LogbookFormModalProps) {
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);
  const [aktivitas, setAktivitas] = useState<string>("");
  const [taskId, setTaskId] = useState<string>("");
  const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const fetchActiveTasks = async () => {
        setLoadingTasks(true);
        try {
          const response = await taskService.getTugasList(); 
          const dataTasks = response.data?.data || response.data || [];
          
          const activeTasks = dataTasks.filter((task: any) => {
            const currentStatus = task.status ? task.status.toLowerCase() : '';
            return (
              currentStatus === 'todo' || 
              currentStatus === 'ongoing' || 
              currentStatus === 'revisi'
            );
          });
          
          const formattedTasks = activeTasks.map((task: any) => ({
            value: String(task.id),
            label: task.judul_tugas || task.judul || task.name || `Tugas #${task.id}`,
          }));

          setTaskOptions(formattedTasks);
        } catch (error) {
          console.error("Gagal mengambil daftar tugas:", error);
        } {
          setLoadingTasks(false);
        }
      };

      fetchActiveTasks();
    } else {
      setAktivitas("");
      setTaskId("");
      setTanggal(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aktivitas.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        tanggal,
        aktivitas,
        tugas_id: taskId ? taskId : undefined, 
      };

      const res = await logbookService.createLogbook(payload);
      if (res.data) {
        onSuccess("Jurnal harian berhasil disimpan.");
        onClose();
      }
    } catch (error: any) {
      console.error("Gagal menyimpan logbook:", error);
      
      // Mengambil pesan error spesifik dari response Laravel backend
      const serverMessage = error.response?.data?.message || "Terjadi kesalahan saat menyimpan logbook harian.";
      
      // Mengirim error ke component induk untuk ditampilkan via Alert template
      onError("Gagal Menyimpan", serverMessage);
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
      <div className="flex justify-between items-center pb-5 mb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
            <InfoIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Isi Jurnal Harian</h3>
            <p className="text-xs text-gray-500">Catat progres, hasil kerja, dan aktivitas magang harian.</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={onClose} 
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Tanggal Aktivitas <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl text-xs outline-none focus:border-brand-500 transition-all text-gray-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Tugas Terkait <span className="text-gray-400 font-normal">(WAJIB)</span>
          </label>
          <div className="mt-1">
            <Select
              options={taskOptions}
              placeholder={loadingTasks ? "Memuat list tugas..." : "Pilih tugas yang di kerjakan hari ini"}
              onChange={(value) => setTaskId(value)}
              className="dark:bg-gray-900 text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Detail Kegiatan / Progress Kerja <span className="text-red-500">*</span>
          </label>
          <textarea
            value={aktivitas}
            onChange={(e) => setAktivitas(e.target.value)}
            placeholder="Jelaskan secara detail refactoring backend, bug fixing, atau logic database apa yang kerjain..."
            rows={5}
            required
            className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl text-xs outline-none focus:border-brand-500 transition-all text-gray-800 dark:text-white resize-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Batalkan
          </Button>
          <Button 
            type="submit" 
            disabled={submitting || !aktivitas.trim()}
            className="flex items-center gap-2"
          >
            <PaperPlaneIcon className="w-4 h-4" />
            {submitting ? 'Sedang Menyimpan...' : 'Simpan Jurnal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}