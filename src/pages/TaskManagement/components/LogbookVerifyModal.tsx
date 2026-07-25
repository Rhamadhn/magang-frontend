import React, { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { Logbook } from "../types";

interface LogbookVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  logbook: Logbook | null;
  onVerify: (id: string, data: { status: string; catatan: string }) => void;
  isSubmitting: boolean;
}

export const LogbookVerifyModal: React.FC<LogbookVerifyModalProps> = ({
  isOpen, onClose, logbook, onVerify, isSubmitting
}) => {
  const [status, setStatus] = useState("disetujui");
  const [catatan, setCatatan] = useState("");

  if (!logbook) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
      <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Verifikasi Logbook</h3>
      <p className="text-sm text-gray-500 mb-6">Mahasiswa: {logbook.intern_name}</p>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Aktivitas Mahasiswa:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{logbook.aktivitas}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Keputusan Mentor</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus("disetujui")}
              className={`py-2 rounded-xl border text-sm font-bold transition-all ${status === 'disetujui' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 dark:border-gray-700'}`}
            >Setujui</button>
            <button
              type="button"
              onClick={() => setStatus("revisi")}
              className={`py-2 rounded-xl border text-sm font-bold transition-all ${status === 'revisi' ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
            >Minta Revisi</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Catatan Mentor (Opsional)</label>
          <textarea
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:border-brand-500 outline-none"
            placeholder="Berikan masukan atau alasan revisi..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button variant="outline" onClick={onClose}>Tutup</Button>
        <Button 
          onClick={() => onVerify(logbook.id, { status, catatan })}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Verifikasi"}
        </Button>
      </div>
    </Modal>
  );
};