// src/pages/TaskManagement/components/ActionMenuModal.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Alert from "../../../components/ui/alert/Alert";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashBinIcon, 
  InfoIcon,
  CalenderIcon // Sesuaikan dengan nama file ekspor asli lo (CalenderIcon / CalendarIcon)
} from "../../../icons";
import { CalendarEvent } from "../types";

interface ActionMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  logbooks: CalendarEvent[];
  tasks: CalendarEvent[];
  onOpenCreateForm: () => void;
  onOpenEditForm: (task: CalendarEvent) => void;
  onDeleteTask: (id: string) => Promise<void>; 
  onOpenDetail: (task: CalendarEvent) => void;
  externalNotification?: { variant: any; title: string; message: string } | null; 
}

const statusBadge: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ongoing: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  review: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  selesai: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
};

export const ActionMenuModal: React.FC<ActionMenuModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  tasks,
  logbooks,
  onOpenCreateForm,
  onOpenEditForm,
  onDeleteTask,
  onOpenDetail,
  externalNotification = null
}) => {
  // State Manajemen Alert/Toast
  const [notification, setNotification] = useState<{ variant: any; title: string; message: string } | null>(null);

  // State Tambahan untuk Modal Konfirmasi Hapus (Solusi Error Compile)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<CalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sinkronisasi Notifikasi dari Parent Component
  useEffect(() => {
    if (externalNotification) {
      setNotification(externalNotification);
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [externalNotification]);

  // Handler memicu modal konfirmasi muncul
  const handleTriggerDelete = (task: CalendarEvent) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  // Eksekusi hapus setelah dikonfirmasi oleh user di dalam modal secondary
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    
    setIsSubmitting(true);
    try {
      await onDeleteTask(taskToDelete.extendedProps.dbId);
      
      // Tampilkan alert sukses
      setNotification({
        variant: "success",
        title: "Berhasil Dihapus",
        message: `Tugas "${taskToDelete.title.replace("Task: ", "")}" berhasil dihapus.`
      });
      
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      setNotification({
        variant: "error",
        title: "Gagal Menghapus",
        message: "Terjadi kesalahan sistem saat mencoba menghapus tugas."
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Parsing representasi waktu lokal panel kiri
  const dateObj = selectedDate ? new Date(selectedDate) : new Date();
  const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
  const dayNum = dateObj.getDate();
  const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

  return (
    <>
      {/* TOAST ALERT POSISI KANAN BAWAH */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[999999] w-full max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      {/* MODAL UTAMA: MENU AKSI TANGGAL */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        className="max-w-[760px] w-full p-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* --- PANEL KIRI: VISUAL DATE IDENTITY & PRIMARY ACTION BUTTON --- */}
          <div className="md:col-span-4 bg-gradient-to-b from-brand-500/10 via-brand-500/[0.02] to-transparent p-8 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
            <div className="my-auto space-y-2">
              <div className="w-12 h-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mx-auto mb-4">
                <CalenderIcon className="w-6 h-6" />
              </div>
              <span className="inline-block text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/5 px-2.5 py-0.5 rounded-md">
                {dayName}
              </span>
              <h2 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
                {dayNum}
              </h2>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {monthYear}
              </p>
            </div>

            {/* BUTTON TAMBAH TUGAS (Ambil posisi dasar kiri) */}
            <button 
              onClick={onOpenCreateForm}
              className="w-full mt-6 text-[11px] font-bold bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-2 uppercase tracking-wider py-3 px-4 rounded-xl shadow-md shadow-brand-500/10 transition-all hover:-translate-y-0.5"
            >
              Tambah Tugas
            </button>
          </div>

          {/* --- PANEL KANAN: CORE WORKSPACE LIST --- */}
          <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-gray-900">
            <div className="space-y-5">
              <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                  Daftar Tugas ({tasks.length})
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Daftar agenda operasional peserta magang.</p>
              </div>

              {/* Task Scrollable Content */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="group p-4 border border-gray-100 dark:border-gray-800/80 rounded-xl bg-gray-50/30 dark:bg-white/[0.01] hover:border-brand-500/40 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge[task.extendedProps.status as keyof typeof statusBadge] || "bg-gray-100"}`}>
                          {task.extendedProps.status}
                        </span>
                        <h5 className="font-bold text-xs text-gray-800 dark:text-white/90 leading-snug">
                          {task.title.replace("Task: ", "")}
                        </h5>
                        <p className="text-[10px] text-gray-400 font-medium">
                          nama peserta magang: <span className="text-gray-600 dark:text-gray-300 font-semibold">{task.extendedProps.intern_name}</span>
                        </p>
                      </div>
                      
                      {/* Action Controls */}
                      <div className="flex gap-0.5 bg-gray-100/60 dark:bg-gray-800/60 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                        <button 
                          onClick={() => onOpenDetail(task)} 
                          title="Detail Tugas"
                          className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <InfoIcon className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onOpenEditForm(task)} 
                          title="Ubah Tugas"
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleTriggerDelete(task)} 
                          title="Hapus Tugas"
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <TrashBinIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                    <p className="text-[11px] text-gray-400 font-medium italic">Tidak ada penugasan terdaftar pada tanggal ini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl px-5 text-xs font-semibold" 
                onClick={onClose}
              >
                Tutup Panel
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* --- MODAL SECONDARY: KONFIRMASI PENGHAPUSAN --- */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        className="max-w-[400px] p-8 z-[99999]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-5">
            <TrashBinIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Konfirmasi Penghapusan</h3>
          <p className="text-sm text-gray-500 mb-8 font-normal px-2 leading-relaxed">
            Apakah Anda yakin ingin menghapus tugas <span className="font-bold text-gray-800 dark:text-white">"{taskToDelete?.title.replace("Task: ", "")}"</span>? Tindakan ini bersifat permanen.
          </p>
          
          <div className="flex gap-3 w-full">
            <Button className="flex-1" variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Batalkan
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 border-none text-white transition-all shadow-lg shadow-red-500/20 rounded-xl" 
              onClick={handleConfirmDelete} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Ya, Hapus Tugas"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};