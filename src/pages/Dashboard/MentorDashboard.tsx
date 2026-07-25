import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { BoxIconLine, CalenderIcon, UserIcon, GroupIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";

// IMPORT API SERVICE
import { evaluationService } from "../../api/evaluationService";
import { taskService } from "../../api/taskService";
import { logbookService } from "../../api/logbookService";
import { getMyProfile } from "../../api/userService";

interface PendingLogbook {
  id: string;
  tanggal: string;
  aktivitas: string;
  nama_intern?: string;
  tipe_data?: string;
  status?: string;
  status_verifikasi?: string;
}

interface UpcomingDeadlineTask {
  id: string;
  judul_tugas: string;
  tenggat_waktu: string;
  sisa_hari: number;
}

export default function MentorDashboard() {
  const { user } = useAuth();

  // 1. State Metrik Utama
  const [totalMhs, setTotalMhs] = useState<number>(0);
  const [logbookPendingCount, setLogbookPendingCount] = useState<number>(0);
  const [tugasRatio, setTugasRatio] = useState<string>("0 / 0");
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  // 2. State Detail Data Diri Mentor
  const [mentorDetails, setMentorDetails] = useState({
    nama: "Menghubungkan ke server...",
    nip: "-",
    jabatan: "Menghubungkan ke server",
  });

  // 3. State Tabel Antrean & Deadline
  const [recentPendingLogbooks, setRecentPendingLogbooks] = useState<PendingLogbook[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingDeadlineTask[]>([]);

  useEffect(() => {
    async function fetchMentorDashboardData() {
      try {
        setLoadingMetrics(true);

        // A. Ambil Profil Mentor
        const profileRes = await getMyProfile();
        const profileData = profileRes.data?.data || profileRes.data;
        if (profileData) {
          const namaMentor = profileData.mentor?.nama || profileData.name || profileData.nama || "Mentor";
          const kontakMentor = profileData.mentor?.no_telp || profileData.username || "-";

          setMentorDetails({
            nama: namaMentor,
            nip: kontakMentor,
            jabatan: "Mentor Lapangan",
          });
        }

        // B. Ambil Total Bimbingan
        const mhsRes = await evaluationService.getMyInterns();
        const listMhs = mhsRes.data?.data || mhsRes.data || [];
        setTotalMhs(listMhs.length);

        // C. Ambil Antrean Logbook Pending
        const logbookRes = await logbookService.getHistoryTable(1, 50);
        const allLogbooks = logbookRes.data?.data || logbookRes.data?.records || [];
        const pendingLogbooks = allLogbooks.filter(
          (log: any) => log.status === "pending" || log.status_verifikasi === "pending"
        );
        setLogbookPendingCount(pendingLogbooks.length);
        setRecentPendingLogbooks(pendingLogbooks.slice(0, 5));

        // D. Ambil Data Tugas untuk Metrik Rasio & Filter Deadline Mendatang
        const tugasRes = await taskService.getTugasList();
        const listTugas = tugasRes.data?.data || tugasRes.data || [];
        
        // Perhitungan Rasio Tugas
        const selesai = listTugas.filter((t: any) => t.status === "selesai" || t.status === "verified").length;
        const berjalan = listTugas.filter((t: any) => t.status === "progress" || t.status === "on-progress").length;
        setTugasRatio(`${berjalan} Progress / ${selesai} Selesai`);

        // Filter Deadline
        const rawDeadlines = listTugas.filter((t: any) => {
          if (!t.deadline && !t.tenggat_waktu) return false;
          const targetDate = new Date(t.deadline || t.tenggat_waktu);
          const diffTime = targetDate.getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 2;
        }).map((t: any) => {
          const targetDate = new Date(t.deadline || t.tenggat_waktu);
          const diffDays = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: t.id,
            judul_tugas: t.judul || t.judul_tugas || "Tugas Teknis",
            tenggat_waktu: targetDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }),
            sisa_hari: diffDays === 0 ? 0 : diffDays
          };
        });
        setUpcomingTasks(rawDeadlines.slice(0, 4));

      } catch (error) {
        console.error("Gagal memuat data dashboard mentor:", error);
      } finally {
        setLoadingMetrics(false);
      }
    }

    fetchMentorDashboardData();
  }, [user]);

  return (
    <>
      <PageMeta title="Console Mentor Dashboard | Sistem Magang Terintegrasi" description="Overview bimbingan dan riwayat logbook" />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Kolom Kiri */}
        <div className="col-span-12 space-y-6 xl:col-span-8">
          
          {/* CARD METRIK */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
                  <GroupIcon className="size-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block">
                  Total Peserta Magang Aktif
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {loadingMetrics ? "..." : `${totalMhs} Orang`}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    Bimbingan
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
                  <CalenderIcon className="size-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block">
                  Logbook Perlu Verifikasi
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {loadingMetrics ? "..." : `${logbookPendingCount} Berkas`}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    logbookPendingCount > 0 
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" 
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  }`}>
                    {logbookPendingCount > 0 ? " Perlu Cek" : "Clean"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="sm:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
                  <BoxIconLine className="size-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block">
                  Tugas Berjalan vs Selesai
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {loadingMetrics ? "..." : tugasRatio}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
                    Rasio Tugas Kelolaan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MONITORING LOG LIST (READ ONLY) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Aktivitas Pengajuan Terbaru
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Daftar riwayat logbook dan tugas masuk dari peserta magang yang memerlukan tindakan Anda
                </p>
              </div>
            </div>

            <div className="mt-4">
              {loadingMetrics ? (
                <p className="text-sm text-gray-500 animate-pulse text-center py-6">Memuat log aktivitas...</p>
              ) : recentPendingLogbooks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                        <th className="pb-3 text-start">Peserta Magang</th>
                        <th className="pb-3 text-start">Tanggal</th>
                        <th className="pb-3 text-start">Aktivitas</th>
                        <th className="pb-3 text-end">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                      {recentPendingLogbooks.map((log) => (
                        <tr key={log.id}>
                          <td className="py-4 font-medium text-gray-800 dark:text-white">
                            <div>{log.nama_intern || "User Magang"}</div>
                            <div className="text-xs text-gray-400 font-normal">
                              {log.tipe_data === 'tugas' ? 'Pengumpulan Tugas' : 'Logbook Harian'}
                            </div>
                          </td>
                          <td className="py-4 whitespace-nowrap">{log.tanggal}</td>
                          <td className="py-4 max-w-xs truncate">{log.aktivitas}</td>
                          <td className="py-4 text-end">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
                              Pending
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-50/30">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Semua Berkas Bersih
                  </p>
                  <p className="text-xs text-gray-400">
                    Tidak ada aktivitas logbook atau tugas berstatus pending saat ini.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PANEL ALUR TUGAS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tugas & Tanggung Jawab Mentor
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Gunakan menu navigasi utama untuk melakukan validasi penuh terhadap perkembangan kompetensi.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-blue-600 uppercase">01. Cek Logbook</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Periksa presensi dan validasi deskripsi aktivitas harian yang dikirim peserta magang.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-emerald-600 uppercase">02. Penilaian Tugas</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Evaluasi tautan hasil kerja tugas mingguan dan berikan status kelayakan.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-purple-600 uppercase">03. Evaluasi Bulanan</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Berikan input nilai kompetensi serta catatan feedback deskriptif di akhir bulan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="col-span-12 space-y-6 xl:col-span-4">
          {/* CARD PROFIL MENTOR */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <UserIcon className="size-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {mentorDetails.nama}
                </h4>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Jabatan / Posisi
                </span>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {mentorDetails.jabatan}
                </p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Otoritas Kerja
                </span>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg inline-block">
                  Monitoring Terintegrasi
                </p>
              </div>
            </div>
          </div>

          {/* WIDGET UPCOMING DEADLINES */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-1">
              Deadline Mendatang
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Tugas kritis yang akan habis dalam waktu dekat (1-2 hari).
            </p>

            <div className="space-y-3">
              {loadingMetrics ? (
                <p className="text-xs text-gray-400 animate-pulse py-2 text-center">Memeriksa linimasa tugas...</p>
              ) : upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-3 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                    <div className="max-w-[70%]">
                      <h5 className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                        {task.judul_tugas}
                      </h5>
                      <p className="text-[11px] text-gray-400 mt-0.5">Batas: {task.tenggat_waktu}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      task.sisa_hari === 0 
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                    }`}>
                      {task.sisa_hari === 0 ? "Hari Ini" : `${task.sisa_hari} Hari Lagi`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl">
                  Aman, tidak ada deadline kritis terdekat.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}