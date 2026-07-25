import { useEffect, useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import PageMeta from "../../components/common/PageMeta";
import { BoxIconLine, CalenderIcon, UserIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";

// IMPORT API
import { logbookService } from "../../api/logbookService";
import { taskService } from "../../api/taskService";
import { getMyProfile } from "../../api/userService";

// Interface disesuaikan persis dengan skema JSON dari backend
interface TaskItem {
  id: string;
  mentor_id: string;
  intern_id: string;
  judul_tugas: string;
  deskripsi: string;
  status: "todo" | "ongoing" | "review" | "revisi" | "selesai" | "verified";
  prioritas: "low" | "medium" | "high";
  deadline: string;
  created_at: string;
  updated_at: string;
}

export default function InternDashboard() {
  const { user } = useAuth();

  // 1. State Metrik Utama
  const [totalLogbook, setTotalLogbook] = useState<number>(0);
  const [totalTugasStr, setTotalTugasStr] = useState<string>("0 / 0");
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  // 2. State Detail Data Diri
  const [internDetails, setInternDetails] = useState({
    nama: "Menghubungkan ke server...",
    nim: "-",
    divisi: "Menghubungkan ke server...",
    mentorName: "menghubungkan ke server...",
  });

  // 3. State Tugas & Filtering
  const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<TaskItem[]>([]);
  const [countRevisi, setCountRevisi] = useState<number>(0);
  const [countSelesai, setCountSelesai] = useState<number>(0);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoadingMetrics(true);

        // Fetch Profile
        const profileRes = await getMyProfile();
        const profileData = profileRes.data?.data || profileRes.data;

        if (profileData && profileData.intern) {
          const namaDivisi = profileData.intern.divisi?.nama_divisi || "Belum Ada Divisi";
          const namaMentor =
            profileData.intern.plotting_aktif?.mentor?.nama ||
            profileData.intern.plotting_aktif?.mentor?.nama_mentor ||
            "Belum Diplotting";

          setInternDetails({
            nama: profileData.intern.nama || profileData.name || "User Magang",
            nim: profileData.intern.nim || "-",
            divisi: namaDivisi,
            mentorName: namaMentor,
          });
        }

        // Fetch Presensi Logbook
        const logbookRes = await logbookService.getHistoryTable(1, 10);
        const totalLog = logbookRes.data?.recordsTotal || logbookRes.data?.data?.length || 0;
        setTotalLogbook(totalLog);

        // Fetch Daftar Tugas
        const tugasRes = await taskService.getTugasList();
        const listTugas: TaskItem[] = tugasRes.data?.data || tugasRes.data || [];

        // Statistik Tugas
        const selesaiCount = listTugas.filter(
          (t) => t.status === "selesai" || t.status === "verified"
        ).length;
        const revisiCount = listTugas.filter((t) => t.status === "revisi").length;

        setCountSelesai(selesaiCount);
        setCountRevisi(revisiCount);
        setTotalTugasStr(`${selesaiCount} / ${listTugas.length}`);

        // Tugas Selesai / Diperiksa Terakhir
        const checked = listTugas
          .filter((t) => t.status === "selesai" || t.status === "verified" || t.status === "revisi")
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setCompletedTasks(checked);

        // Tugas Belum Selesai (Mendekati Deadline)
        const activeTasks = listTugas
          .filter((t) => t.status !== "selesai" && t.status !== "verified")
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        setUpcomingDeadlines(activeTasks);

      } catch (error) {
        console.error("Gagal memuat data dashboard intern:", error);
      } finally {
        setLoadingMetrics(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  const internMetricsData = [
    {
      title: "Total Presensi Logbook",
      value: loadingMetrics ? "..." : `${totalLogbook} Hari`,
      changeRate: "Hadir",
      isPositive: true,
      icon: <CalenderIcon className="text-gray-800 size-6 dark:text-white/90" />,
    },
    {
      title: "Penyelesaian Tugas",
      value: loadingMetrics ? "..." : totalTugasStr,
      changeRate: countRevisi > 0 ? `${countRevisi} Perlu Revisi` : "Progress",
      isPositive: countRevisi === 0,
      icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
    },
  ];

  // Helper Format Tanggal & Badge Deadline
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeadlineBadge = (deadlineStr: string) => {
    const now = new Date().getTime();
    const target = new Date(deadlineStr).getTime();
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400">
          Terlewat
        </span>
      );
    }
    if (diffHours < 24) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
          Hampir Habis
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
        Aktif
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Console Peserta Magang Dashboard | Sistem Magang Terintegrasi"
        description="Overview aktivitas dan status penugasan magang"
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <EcommerceMetrics metrics={internMetricsData} />

          {/* SECTION 1: Status Tugas Terakhir yang Diperiksa Mentor */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Status Review Penugasan Terbaru
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Daftar tugas yang telah diperiksa atau ditinjau oleh mentor
                </p>
              </div>
              {countRevisi > 0 && (
                <span className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 rounded-full">
                  {countRevisi} Tugas Perlu Revisi
                </span>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {loadingMetrics ? (
                <div className="py-6 text-center">
                  <p className="text-gray-500 text-sm animate-pulse">Memuat status tugas...</p>
                </div>
              ) : completedTasks.length > 0 ? (
                completedTasks.slice(0, 3).map((task) => {
                  const isRevisi = task.status === "revisi";

                  return (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-2xl transition-all ${
                        isRevisi
                          ? "border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/10"
                          : "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                                isRevisi
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                              }`}
                            >
                              {isRevisi ? "Perlu Revisi" : "Selesai"}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-md">
                              Prioritas: {task.prioritas}
                            </span>
                          </div>

                          <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                            {task.judul_tugas}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {task.deskripsi}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-gray-400 block">Diperbarui:</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDate(task.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-50/30">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Belum Ada Tugas Selesai
                  </p>
                  <p className="text-xs text-gray-400">
                    Belum ada tugas yang diselesaikan atau diperiksa oleh mentor.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Daftar Tugas Aktif & Deadline */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-1">
              Tugas Mendekati Deadline
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Pantau batas waktu pengerjaan tugas aktif agar diselesaikan tepat waktu
            </p>

            {loadingMetrics ? (
              <p className="text-sm text-gray-500 animate-pulse text-center py-4">
                Memuat daftar deadline...
              </p>
            ) : upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold text-gray-800 dark:text-white">
                          {task.judul_tugas}
                        </h5>
                        {getDeadlineBadge(task.deadline)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {task.deskripsi || "Tidak ada deskripsi detail"}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-gray-400 block">Batas Waktu:</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {formatDate(task.deadline)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Tidak ada tugas aktif yang perlu dikerjakan saat ini.
              </p>
            )}
          </div>
        </div>

        {/* Blok Identitas Kanan */}
        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <UserIcon className="size-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {internDetails.nama}
                </h4>
                <p className="text-xs text-gray-400">ID Peserta Magang: {internDetails.nim}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Divisi Kerja
                </span>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {internDetails.divisi}
                </p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Mentor Pembimbing
                </span>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {internDetails.mentorName}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Ringkasan Penugasan
                </span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {countSelesai}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      Selesai
                    </span>
                  </div>
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40">
                    <span className="block text-lg font-bold text-red-600 dark:text-red-400">
                      {countRevisi}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      Perlu Revisi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}