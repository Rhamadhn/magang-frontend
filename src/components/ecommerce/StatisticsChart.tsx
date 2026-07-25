import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Tambahkan interface Props agar komponen ini bisa menerima data asli
interface StatisticsChartProps {
  categories: string[]; // Contoh: ["Bulan 1", "Bulan 2", "Bulan 3"] atau nama kriteria
  seriesData: {
    name: string;
    data: number[];
  }[];
  title?: string;
  subtitle?: string;
}

export default function StatisticsChart({ 
  categories, 
  seriesData, 
  title = "Statistik Performa Magang", 
  subtitle = "Grafik perkembangan nilai evaluasi Anda" 
}: StatisticsChartProps) {
  
  const options: ApexOptions = {
    legend: {
      show: true, // Nyalakan legend agar tahu arti garisnya
      position: "top",
      horizontalAlign: "right",
    },
    colors: ["#465FFF", "#10B981"], // Biru untuk nilai rata-rata, hijau alternatif
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area", 
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth", // Ubah jadi smooth agar terlihat lebih modern & profesional
      width: [3, 3],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.05,
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
    },
    xaxis: {
      type: "category",
      categories: categories, // Dinamis dari props
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      max: 100, // Batasi nilai maksimal 100 sesuai standar penilaian akademik
      min: 0,
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {/* Pastikan type di sini diubah jadi "area" agar gradien fill-nya aktif */}
          <Chart options={options} series={seriesData} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}