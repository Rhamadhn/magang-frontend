import { useEffect, useState, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import LogbookFormModal from "./components/LogbookFormModal";
import { logbookService } from "../../api/logbookService";
import { taskService } from "../../api/taskService";
import { 
  PencilIcon, 
  CheckCircleIcon, 
  AlertIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  DocsIcon,
  FileIcon,
  DownloadIcon
} from "../../icons"; 

interface RawHistoryItem {
  id: string;
  tanggal: string;
  aktivitas: string;
  status: string;
  tugas_id?: string;
  assignment_tugas_id?: string;
  link_progres?: string;
  file_path?: string;
  catatan_pengumpulan?: string;
  tipe_data?: string;
}

interface GroupedTask {
  taskId: string;
  judulTugas: string;
  deskripsiTugas?: string;
  deadline?: string;
  statusTugas?: string;
  logbooks: RawHistoryItem[];
}

type AlertVariant = "success" | "error" | "warning" | "info";

export default function LogbookPage() {
  const [groupedTasks, setGroupedTasks] = useState<GroupedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Pagination (Konsisten dengan MyInternsPage)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 10;

  const [notification, setNotification] = useState<{
    variant: AlertVariant; 
    title: string; 
    message: string;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (variant: AlertVariant, title: string, message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ variant, title, message });
    timerRef.current = setTimeout(() => setNotification(null), 5000);
  };

  // Helper untuk resolve URL file dari Laravel Storage
  const getFileUrl = (filePath?: string) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const cleanPath = filePath.replace(/\\/g, "");
    const storageBase = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
    return `${storageBase}/${cleanPath.replace(/^\//, "")}`;
  };

  // Helper untuk menentukan label teks tombol berdasarkan ekstensi file
  const getFileLabel = (filePath?: string) => {
    if (!filePath) return "Dokumen Lampiran";
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return "Dokumen PDF";
    if (['doc', 'docx'].includes(ext || '')) return "Dokumen Word";
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return "Berkas Gambar";
    if (['zip', 'rar', '7z'].includes(ext || '')) return "Arsip / Zip";
    return "Dokumen Lampiran";
  };

  const fetchAndGroupData = async (page: number) => {
    try {
      setLoading(true);

      const [historyRes, taskRes] = await Promise.all([
        logbookService.getHistoryTable(page, perPage, ""),
        taskService.getTugasList().catch(() => ({ data: [] }))
      ]);

      const rawRes = historyRes.data || historyRes;
      const historyData: RawHistoryItem[] = rawRes.data || rawRes || [];
      
      setCurrentPage(rawRes.current_page || page);
      setTotalPages(rawRes.last_page || 1);
      setTotalItems(rawRes.total || historyData.length);

      const masterTasks = taskRes.data?.data || taskRes.data || [];

      const taskMap: Record<string, any> = {};
      masterTasks.forEach((t: any) => {
        taskMap[t.id] = t;
      });

      const groups: Record<string, GroupedTask> = {};

      historyData.forEach((item) => {
        const tId = item.assignment_tugas_id || item.tugas_id || "general";
        
        if (!groups[tId]) {
          const detailTugas = taskMap[tId];
          groups[tId] = {
            taskId: tId,
            judulTugas: detailTugas?.judul_tugas || detailTugas?.judul || (tId === "general" ? "Aktivitas Harian Umum" : "Tugas ID: " + tId.slice(0, 8)),
            deskripsiTugas: detailTugas?.deskripsi,
            deadline: detailTugas?.deadline,
            statusTugas: detailTugas?.status,
            logbooks: []
          };
        }

        groups[tId].logbooks.push(item);
      });

      const result = Object.values(groups);
      setGroupedTasks(result);

      if (result.length > 0 && page === 1) {
        setOpenTaskId(result[0].taskId);
      }

    } catch (err: any) {
      showToast("error", "Gagal", "Gagal memuat rekapitulasi logbook");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGroupData(currentPage);
  }, [currentPage]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const res = await logbookService.downloadReportPdf();
      
      if (res.data?.type && res.data.type.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || "Gagal mengunduh berkas laporan");
      }

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Laporan_Magang_Rekap_${new Date().toISOString().slice(0,10)}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("success", "Berhasil", "Laporan PDF berhasil diunduh");
    } catch (err: any) {
      let errorMsg = "Gagal mengekspor dokumen laporan ke PDF";
      if (err.response?.data instanceof Blob) {
        try {
          const resText = await err.response.data.text();
          const parsed = JSON.parse(resText);
          errorMsg = parsed.message || errorMsg;
        } catch (_) {}
      } else if (err.message) {
        errorMsg = err.message;
      }

      showToast("error", "Ekspor Gagal", errorMsg);
    } finally {
      setDownloading(false);
    }
  };

  const getStatusBadge = (statusStr?: string) => {
    const text = statusStr ? statusStr.toLowerCase() : "";
    if (text.includes("disetujui") || text.includes("approved") || text.includes("selesai")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Disetujui
        </span>
      );
    }
    if (text.includes("revisi")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertIcon className="w-3.5 h-3.5" /> Perlu Revisi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        Pending
      </span>
    );
  };

  return (
    <>
      <PageMeta title="Logbook & Penugasan | Peserta Magang App" description="Rekap logbook per tugas" />
      <PageBreadcrumb pageTitle="Laporan & Riwayat" />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Daftar Logbook Berdasarkan Tugas">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Total Entri Logbook: <strong className="text-gray-800 dark:text-gray-200">{totalItems}</strong>
            </span>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-semibold border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>{downloading ? "Mengunduh..." : "Export PDF"}</span>
              </Button>

              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold"
              >
                <PencilIcon className="w-4 h-4" /> 
                <span>Isi Logbook Harian</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              Memuat dan mengelompokkan data logbook...
            </div>
          ) : groupedTasks.length > 0 ? (
            <div className="space-y-4">
              {groupedTasks.map((group) => {
                const isOpen = openTaskId === group.taskId;

                return (
                  <div 
                    key={group.taskId} 
                    className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm transition-all duration-200"
                  >
                    <div 
                      onClick={() => setOpenTaskId(isOpen ? null : group.taskId)}
                      className="p-5 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between cursor-pointer hover:bg-gray-100/70 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-md">
                            Tugas Magang
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            ({group.logbooks.length} Logbook)
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {group.judulTugas}
                        </h3>

                        {group.deskripsiTugas && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {group.deskripsiTugas}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                                <th className="py-3 px-3">Tanggal</th>
                                <th className="py-3 px-3">Aktivitas / Progress Harian</th>
                                <th className="py-3 px-3">Tautan / Lampiran</th>
                                <th className="py-3 px-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                              {group.logbooks.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                                  <td className="py-3.5 px-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                    📅 {log.tanggal}
                                  </td>
                                  <td className="py-3.5 px-3 text-gray-800 dark:text-gray-200 max-w-md">
                                    <p className="whitespace-pre-line leading-relaxed">{log.aktivitas}</p>
                                    
                                    {log.catatan_pengumpulan && (
                                      <div className="mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-300 text-[11px] italic">
                                        Catatan Mentor: "{log.catatan_pengumpulan}"
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-3 whitespace-nowrap">
                                    <div className="flex flex-col gap-1.5">
                                      {/* Tautan Progres / Link External */}
                                      {log.link_progres && (
                                        <a 
                                          href={log.link_progres.startsWith("http") ? log.link_progres : `https://${log.link_progres}`} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                        >
                                          <DocsIcon className="w-3.5 h-3.5 shrink-0 text-blue-500" /> 
                                          <span>Link Progres</span>
                                        </a>
                                      )}

                                      {/* File Attachment dengan label Teks Bersih */}
                                      {log.file_path && (
                                        <a 
                                          href={getFileUrl(log.file_path)}
                                          target="_blank" 
                                          rel="noreferrer"
                                          download
                                          className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                                          title="Klik untuk melihat / mengunduh berkas"
                                        >
                                          <FileIcon className="w-3.5 h-3.5 shrink-0 text-rose-500" /> 
                                          <span>{getFileLabel(log.file_path)}</span>
                                        </a>
                                      )}

                                      {!log.link_progres && !log.file_path && (
                                        <span className="text-gray-400 italic text-[11px]">- Tidak Ada Lampiran -</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-3 whitespace-nowrap">
                                    {getStatusBadge(log.status)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 italic bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              Belum ada riwayat jurnal logbook.
            </div>
          )}

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Halaman {currentPage} dari {totalPages || 1}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1 || loading}
                className="rounded-lg text-xs font-semibold"
              >
                Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="rounded-lg text-xs font-semibold"
              >
                Berikutnya
              </Button>
            </div>
          </div>

        </ComponentCard>
      </div>

      <LogbookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => {
          showToast("success", "Berhasil", msg);
          fetchAndGroupData(currentPage);
        }}
        onError={(title, msg) => {
          showToast("error", title, msg);
        }}
      />
    </>
  );
}