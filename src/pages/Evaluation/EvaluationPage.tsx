import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { evaluationService } from "../../api/evaluationService";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { UserCircleIcon, PencilIcon, InfoIcon } from "../../icons";
import { MentorEvaluationForm } from "./components/MentorEvaluationForm";
import { ViewEvaluationModal } from "./components/ViewEvaluationModal";

export default function EvaluationPage() {
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // Default bulan ini

  // --- States untuk Form (Update/Create) ---
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- States untuk Modal Detail (View) ---
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailInternId, setDetailInternId] = useState<string>("");

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const res = await evaluationService.getMyInterns();
      setInterns(res.data.data || []);
    } catch (err) {
      showToast("error", "Error", "Gagal memuat daftar peserta magang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const showToast = (variant: string, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // --- Handler untuk Buka Form ---
  const handleOpenForm = (intern: any) => {
    setSelectedIntern(intern);
    setIsFormOpen(true);
  };

  // --- Handler untuk Buka Detail ---
  const handleOpenDetail = (intern: any) => {
    setDetailInternId(intern.intern_id);
    setIsDetailOpen(true);
  };

  // --- Handler untuk Hapus/Reset Evaluasi ---
  const handleResetEvaluation = async (id: string) => {
    try {
      await evaluationService.resetEvaluation(id);
      showToast("success", "Berhasil", "Data evaluasi telah direset.");
      setIsDetailOpen(false);
      fetchInterns();
    } catch (err) {
      showToast("error", "Gagal", "Gagal menghapus data evaluasi.");
    }
  };

  return (
    <>
      <PageMeta title="Evaluasi Kompetensi | Sistem Magang Terinregrasi" description="Penilaian capaian peserta magang" />
      <PageBreadcrumb pageTitle="Evaluasi Kompetensi" />

      {/* TOAST ALERT POSISI KANAN BAWAH (KONSISTEN) */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      {!isFormOpen ? (
        <div className="space-y-6">
          {/* PEMILIH PERIODE (UPGRADED DESIGN) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center shrink-0">
                <InfoIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white">Periode Evaluasi</h3>
                <p className="text-xs text-gray-400">Pilih bulan peninjauan performa peserta magang</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">Bulan:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* DAFTAR INTERNSHIP (UPGRADED CARD DESIGN) */}
          <ComponentCard title="Daftar Peserta Magang">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.01] animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-100 dark:bg-gray-800/50 rounded-xl"></div>
                    <div className="flex gap-3 pt-2">
                      <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl flex-1"></div>
                      <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : interns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interns.map((intern) => (
                  <div
                    key={intern.intern_id}
                    className="group relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.01] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-none hover:border-brand-500/20 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Bagian Header Profil Intern di dalam Card */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700/50 shrink-0 group-hover:border-brand-500/20 transition-colors">
                            <UserCircleIcon className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1">
                              {intern.nama_intern || intern.user?.nama || "Nama Peserta Magang"}
                            </h4>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                              ID Peserta Magang. {intern.nim || intern.student_number || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Penempatan / Institusi */}
                      {/* <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800/50 space-y-2 mb-5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Divisi</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {intern.divisi?.nama_divisi || "-"}
                          </span>
                        </div>
                      </div> */}
                    </div>

                    {/* Tombol Aksi yang Konsisten */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl gap-2 font-medium border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => handleOpenDetail(intern)}
                      >
                        <InfoIcon className="w-4 h-4" /> Detail
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 rounded-xl gap-2 font-medium bg-brand-500 hover:bg-brand-600 text-white border-none shadow-sm"
                        onClick={() => handleOpenForm(intern)}
                      >
                        <PencilIcon className="w-4 h-4" /> Beri Nilai
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800/50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCircleIcon className="w-6 h-6" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Belum ada peserta magang yang terdaftar.</p>
              </div>
            )}
          </ComponentCard>
        </div>
      ) : (
        <MentorEvaluationForm
          intern={selectedIntern}
          periode={selectedMonth}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            showToast("success", "Berhasil", "Evaluasi berhasil disimpan.");
            fetchInterns();
          }}
        />
      )}

      <ViewEvaluationModal
        internId={detailInternId}
        periode={selectedMonth}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDelete={handleResetEvaluation}
      />
    </>
  );
}