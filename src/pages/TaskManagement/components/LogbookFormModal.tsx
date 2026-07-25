import React, { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { CalendarEvent } from "../types";

interface LogbookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  tasks: CalendarEvent[]; // tasks yang diklik di tanggal tersebut
  onSave: (formData: FormData) => void;
  isSubmitting: boolean;
}

export const LogbookFormModal: React.FC<LogbookFormModalProps> = ({
  isOpen, onClose, selectedDate, tasks, onSave, isSubmitting
}) => {
  const [aktivitas, setAktivitas] = useState("");
  const [tugasId, setTugasId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("tanggal", selectedDate);
    formData.append("aktivitas", aktivitas);
    if (tugasId) formData.append("tugas_id", tugasId);
    if (file) formData.append("file_tugas", file);
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
       {/* Isi sama seperti sebelumnya, tapi sekarang type safe */}
       {/* Map task: tasks.map((t: CalendarEvent) => ...) */}
       <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... input fields ... */}
          <select value={tugasId} onChange={(e) => setTugasId(e.target.value)} className="...">
            <option value="">Laporan Harian (Tanpa Tugas)</option>
            {tasks.map((t: CalendarEvent) => (
              <option key={t.id} value={t.extendedProps.dbId}>{t.title}</option>
            ))}
          </select>
          <Button type="submit" disabled={isSubmitting}>Kirim</Button>
       </form>
    </Modal>
  );
};