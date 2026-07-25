import React, { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { evaluationService } from "../../../api/evaluationService";
import { InfoIcon, TrashBinIcon } from "../../../icons"; // Pastikan import ikon lo sesuai

interface ViewEvaluationModalProps {
  internId: string;
  isOpen: boolean;
  periode: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const ViewEvaluationModal: React.FC<ViewEvaluationModalProps> = ({
  internId,
  isOpen,
  periode,
  onClose,
  onDelete,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk menangani sub-konfirmasi hapus (menggantikan window.confirm)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && internId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await evaluationService.getInternEvaluation(internId, periode);
          setData(res.data.data || []);
        } catch (err) {
          console.error("Gagal mengambil riwayat evaluasi", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
    // Reset state konfirmasi setiap kali modal dibuka/ditutup
    if (!isOpen) {
      setShowConfirmDelete(false);
    }
  }, [isOpen, internId, periode]);

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(internId);
      setShowConfirmDelete(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[520px] p-8">
      {!showConfirmDelete ? (
        <div className="flex flex-col">
          {/* HEADER MODAL */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <InfoIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Capaian Kompetensi</h3>
              <p className="text-xs text-gray-400">Daftar penilaian kualitatif pada periode peninjauan.</p>
            </div>
          </div>

          {/* KONTEN / RIWAYAT KARTU */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-12 text-sm text-gray-400 animate-pulse flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Sinkronisasi data penilaian...</span>
              </div>
            ) : data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800/80 shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="text-sm font-bold text-gray-800 dark:text-white/90 leading-tight">
                      {item.kriteria?.nama_kriteria || "Kriteria Penilaian"}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        item.level?.toLowerCase() === "mahir"
                          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                          : item.level?.toLowerCase() === "menengah"
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-gray-100 dark:border-gray-800/60 pt-3 mt-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                        Indikator & Alasan:
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed bg-white dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100/50 dark:border-gray-800/40">
                        "{item.mengapa_level_ini || "Tidak ada penjelasan tambahan."}"
                      </p>
                    </div>

                    {item.saran_pengembangan && (
                      <div>
                        <label className="text-[10px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-wider block mb-1">
                          Rekomendasi Pengembangan:
                        </label>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 pl-1">
                          {item.saran_pengembangan}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-100 dark:border-gray-800/80 rounded-2xl">
                <p className="text-gray-400 text-xs font-medium">Belum ada riwayat penilaian pada periode ini.</p>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS UTAMA */}
          <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            {data.length > 0 && (
              <Button
              className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-none rounded-xl font-semibold transition-all duration-200 shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20"
              onClick={() => setShowConfirmDelete(true)}
            >
              Reset Nilai
            </Button>
            )}
            <Button className="flex-1 rounded-xl font-medium" variant="outline" onClick={onClose}>
              Tutup Jendela
            </Button>
          </div>
        </div>
      ) : (
        /* SCREEN KONFIRMASI HAPUS (KONSISTEN DENGAN MODAL DELETE DIVISI) */
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-5">
            <TrashBinIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Konfirmasi Reset Nilai</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-normal max-w-sm leading-relaxed">
            Apakah Anda yakin ingin menghapus seluruh rekaman evaluasi internship ini pada bulan{" "}
            <span className="font-bold text-gray-800 dark:text-white">"{periode}"</span>? Tindakan ini bersifat permanen.
          </p>

          <div className="flex gap-3 w-full">
            <Button
              className="flex-1 rounded-xl font-medium"
              variant="outline"
              onClick={() => setShowConfirmDelete(false)}
              disabled={isSubmitting}
            >
              Batalkan
            </Button>
            <Button
              className="flex-1 rounded-xl font-medium bg-red-600 hover:bg-red-700 border-none text-white transition-all shadow-lg shadow-red-500/10"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mereset..." : "Ya, Hapus Permanen"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};