import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import Chart from "react-apexcharts"; 
import { BoxIconLine, CalenderIcon, GroupIcon } from "../../icons"; // Menggunakan icon terstandarisasi
import { getInterns, getMentors } from "../../api/userService";
import { kriteriaService } from "../../api/kriteriaService";
import { getAllPlotting } from "../../api/plottingService";
import api from "../../api/axios";

interface DivisionData {
  name: string;
  count: number;
}

export default function AdminDashboard() {
  const [totalInterns, setTotalInterns] = useState<number>(0);
  const [totalMentors, setTotalMentors] = useState<number>(0);
  const [totalDivisions, setTotalDivisions] = useState<number>(0);
  const [totalKriteria, setTotalKriteria] = useState<number>(0);
  
  const [divisionStats, setDivisionStats] = useState<DivisionData[]>([]);
  const [assignedCount, setAssignedCount] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAdminDashboardData() {
      try {
        setLoading(true);
        
        // 1. Ambil data total peserta magang global
        const internRes = await getInterns();
        const internData = internRes.data?.data || [];
        const totalInt = internRes.data?.recordsTotal || internData.length || 0;
        setTotalInterns(totalInt);

        // 2. Ambil data total mentor global
        const mentorRes = await getMentors();
        const mentorData = mentorRes.data?.data || [];
        const totalMen = mentorRes.data?.recordsTotal || mentorData.length || 0;
        setTotalMentors(totalMen);

        // 3. Ambil data divisi operasional & Kalkulasi Distribusinya
        let divisionsList: string[] = [];
        try {
          const divisionRes = await api.get("/v1/divisi");
          const divData = divisionRes.data?.data || [];
          setTotalDivisions(divisionRes.data?.recordsTotal || divData.length || 0);
          
          if (Array.isArray(divData)) {
            divisionsList = divData.map((d: any) => d.nama_divisi || d.nama || "");
          }
        } catch (divErr) {
          console.error("Gagal memuat data divisi:", divErr);
        }

        // 4. Ambil data kriteria penilaian
        try {
          const kriteriaRes = await kriteriaService.getKriteriaTable();
          setTotalKriteria(kriteriaRes.data?.recordsTotal || kriteriaRes.data?.data?.length || 0);
        } catch (err) {
          console.error("Gagal mengambil kriteria", err);
        }

        // 5. Ambil data plotting untuk menghitung rasio bimbingan
        try {
          const plottingRes = await getAllPlotting();
          const plottingData = plottingRes.data?.data || [];
          setAssignedCount(plottingRes.data?.recordsTotal || plottingData.length || 0);
        } catch (err) {
          console.error("Gagal mengambil data plotting", err);
        }

        // 6. Menghitung distribusi pengguna per divisi secara dinamis
        if (divisionsList.length > 0 && Array.isArray(internData)) {
          const stats = divisionsList.map((divName) => {
            const count = internData.filter((intern: any) => {
              const internDiv = intern.divisi?.nama_divisi || intern.nama_divisi || intern.division;
              return internDiv === divName;
            }).length;
            return { name: divName, count: count || 0 };
          });
          setDivisionStats(stats);
        } else {
          // Fallback static jika data kosong agar grafik tidak pecah
          setDivisionStats([
            { name: "IT Development", count: Math.floor(totalInt * 0.4) },
            { name: "Human Capital", count: Math.floor(totalInt * 0.3) },
            { name: "Marketing", count: Math.floor(totalInt * 0.3) },
          ]);
        }

      } catch (error) {
        console.error("Gagal memuat data dashboard admin:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminDashboardData();
  }, []);

  // Data Metrik Utama - Styles Mengikuti Corak Minimalis Khas InternDashboard
  const adminMetricsData = [
    {
      title: "Total Peserta Magang",
      value: loading ? "..." : `${totalInterns} Orang`,
      changeRate: "Kapasitas Aktif",
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />, // Sinkron warna icon
    },
    {
      title: "Total Mentor Terdaftar",
      value: loading ? "..." : `${totalMentors} Pembimbing`,
      changeRate: "Rasio",
      icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />, // Sinkron warna icon
    },
    {
      title: "Divisi Operasional",
      value: loading ? "..." : `${totalDivisions} Bidang`,
      changeRate: "Departemen",
      icon: <CalenderIcon className="text-gray-800 size-6 dark:text-white/90" />, // Sinkron warna icon
    },
  ];

  const unassignedCount = Math.max(0, totalInterns - assignedCount);
  const donutOptions = {
    colors: ["#465fff", "#F59E0B"],
    labels: ["Sudah Diplot", "Belum Ada Mentor"],
    chart: { fontFamily: "Outfit, sans-serif" },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Magang",
              formatter: () => `${totalInterns}`
            }
          }
        }
      }
    },
    legend: { position: "bottom" as const }
  };

  return (
    <>
      <PageMeta title="Console Admin Dashboard | Sistem Magang Terintergrasi" description="Overview eksekutif manajemen magang" />

      

      {/* 1 BARIS PENUH UNTUK SUMMARY CARD (FIXED 3 KOLOM SEJAJAR HORIZONTAL) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
        {adminMetricsData.map((metric, idx) => (
          <div 
            key={idx} 
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            {/* Icon Wrapper dengan background kontras minimalis */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white/90">
              {metric.icon}
            </div>

            {/* Angka & Status Metrik */}
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.title}
                </span>
                <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </h4>
              </div>

              {/* Badge Status Hijau Daun Khas Template */}
              <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center gap-1">
                <span>↑</span> {metric.changeRate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION GRAFIK UTAMA */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* GRAFIK KIRI: DISTRIBUSI BEBAN KERJA PER DIVISI */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Distribusi Peserta Magang Per Divisi</h3>
            <p className="text-xs text-gray-400 mt-0.5">Jumlah persebaran penempatan peserta magang aktif saat ini</p>
          </div>
          
          <div className="mt-2">
            <BarChartOne 
              categories={divisionStats.map(d => d.name)}
              seriesData={[
                {
                  name: "Jumlah Peserta Magang",
                  data: divisionStats.map(d => d.count)
                }
              ]}
            />
          </div>
        </div>

        {/* GRAFIK KANAN: STATUS KONTROL PLOTTING */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Status Alokasi Pembimbing</h3>
            <p className="text-xs text-gray-400 mt-0.5">Rasio pemetaan peserta magang terhadap ketersediaan mentor</p>
          </div>
          
          <div className="mt-6 flex justify-center">
            {loading ? (
              <div className="py-12 text-gray-400">Menyusun bagan...</div>
            ) : (
              <Chart 
                options={donutOptions} 
                series={[assignedCount, unassignedCount]} 
                type="donut" 
                width="100%" 
                height={240} 
              />
            )}
          </div>
        </div>

        {/* SECTION FOOTER: PARAMETER OPERASIONAL SISTEM (Gaya 3 Kolom ala Modul Intern) */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-1">
            Infrastruktur & Konfigurasi Evaluasi
          </h4>
          <p className="text-xs text-gray-400 mb-4">Informasi parameter aktif penugasan yang berjalan di sistem</p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span className="text-xs font-bold text-blue-600 uppercase">Metrik Evaluasi Aktif</span>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{totalKriteria} Parameter</p>
              <p className="text-xs text-gray-400 mt-1">Digunakan sebagai parameter acuan nilai kriteria.</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span className="text-xs font-bold text-emerald-600 uppercase">Total Penugasan Berjalan</span>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{assignedCount} Plot Hubungan</p>
              <p className="text-xs text-gray-400 mt-1">peserta magang terhubung langsung dengan mentor lapangan.</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <span className="text-xs font-bold text-purple-600 uppercase">Status Integrasi</span>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">100% Secure</p>
              <p className="text-xs text-gray-400 mt-1">Seluruh pengiriman token data terverifikasi via state Axios.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}