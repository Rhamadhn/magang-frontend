import React from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { PlusIcon, PencilIcon, CalenderIcon } from "../../../icons";
import { Intern } from "../types";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  isSubmitting: boolean;
  internList: Intern[];
  selectedIntern: string;
  setSelectedIntern: (v: string) => void;
  eventPrioritas: string;
  setEventPrioritas: (v: string) => void;
  eventTitle: string;
  setEventTitle: (v: string) => void;
  eventDescription: string;
  setEventDescription: (v: string) => void;
  eventDeadline: string;
  setEventDeadline: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  isEditMode,
  isSubmitting,
  internList,
  selectedIntern,
  setSelectedIntern,
  eventPrioritas,
  setEventPrioritas,
  eventTitle,
  setEventTitle,
  eventDescription,
  setEventDescription,
  eventDeadline,
  setEventDeadline,
  onSubmit,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-[840px] w-full p-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800"
    >
      <form onSubmit={onSubmit} className="flex flex-col bg-white dark:bg-gray-900">
        
        {/* --- HEADER MODAL --- */}
        <div className="flex items-center gap-3.5 p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="w-11 h-11 bg-brand-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-500/10 shrink-0">
            {isEditMode ? <PencilIcon className="w-5 h-5" /> : <PencilIcon className="w-5 h-5 stroke-[2.5]" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {isEditMode ? "Ubah Instruksi Tugas" : "Kirim Tugas Baru"}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Lengkapi detail parameter dan instruksi kerja eksekusi log untuk peserta magang.
            </p>
          </div>
        </div>
        
        {/* --- CONTENT FORM (HORIZONTAL LAYOUT GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          
          {/* PANEL SEBELAH KIRI: PARAMETER UTAMA & IDENTITAS */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Pilih Peserta Magang
              </label>
              <select 
                required
                value={selectedIntern} 
                onChange={(e) => setSelectedIntern(e.target.value)} 
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-4 text-xs font-medium focus:border-brand-500 dark:focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all dark:bg-gray-900 text-gray-700 dark:text-gray-200"
              >
                <option value="" className="dark:bg-gray-900">Pilih Peserta Magang</option>
                {internList.map(i => (
                  <option key={i.id} value={i.id} className="dark:bg-gray-900">{i.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Prioritas Tugas
              </label>
              <select 
                value={eventPrioritas} 
                onChange={(e) => setEventPrioritas(e.target.value)} 
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-4 text-xs font-medium focus:border-brand-500 dark:focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all dark:bg-gray-900 text-gray-700 dark:text-gray-200"
              >
                {/* <option value="low" className="dark:bg-gray-900">Low</option> */}
                <option value="normal" className="dark:bg-gray-900">Normal</option>
                <option value="high" className="dark:bg-gray-900">High (Penting)</option>
                <option value="urgent" className="dark:bg-gray-900">Urgent (Segera!)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Batas Waktu (Deadline)
              </label>
              <div className="relative flex items-center">
                <input 
                  required
                  type="datetime-local" 
                  value={eventDeadline} 
                  onChange={(e) => setEventDeadline(e.target.value)} 
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-4 text-xs font-medium focus:border-brand-500 outline-none transition-all text-gray-700 dark:text-gray-200" 
                />
              </div>
            </div>
          </div>

          {/* PANEL SEBELAH KANAN: SPESIFIKASI DAN KONTEN PENUGASAN */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Judul Tugas
              </label>
              <input 
                required
                type="text" 
                placeholder="Misal: Optimasi Query Database atau Refactor Modul" 
                value={eventTitle} 
                onChange={(e) => setEventTitle(e.target.value)} 
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-4 text-xs font-medium focus:border-brand-500 outline-none transition-all text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600" 
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Deskripsi / Instruksi Kerja
              </label>
              <textarea 
                required
                placeholder="Berikan panduan pengerjaan, batasan arsitektur, atau endpoint target secara detail..." 
                value={eventDescription} 
                onChange={(e) => setEventDescription(e.target.value)} 
                className="w-full flex-1 min-h-[138px] md:min-h-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-4 py-3 text-xs font-medium focus:border-brand-500 outline-none transition-all resize-none text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 leading-relaxed" 
              />
            </div>
          </div>

        </div>

        {/* --- ACTIONS FOOTER --- */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.005]">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose} 
            type="button"
            className="rounded-xl px-5 text-xs font-semibold"
          >
            Batalkan
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={isSubmitting}
            className="rounded-xl px-6 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/10 transition-all"
          >
            {isSubmitting ? "Memproses..." : isEditMode ? "Simpan Perubahan" : "Kirim Tugas"}
          </Button>
        </div>

      </form>
    </Modal>
  );
};