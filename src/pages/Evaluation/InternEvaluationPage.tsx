import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import InternRadarChart from "./components/InternRadarChart";
import { evaluationService } from "../../api/evaluationService";

export default function InternEvaluationView() {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);
  // Gunakan nama 'periode' agar konsisten dengan state di bawah
  const [periode, setPeriode] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        // Memanggil fungsi yang sudah diperbaiki di service
        const res = await evaluationService.getMyPerformance(periode);
        
        // Data biasanya dibungkus Laravel dalam res.data.data
        setPerformanceData(res.data.data); 
      } catch (err) {
        console.error("Gagal memuat data", err);
      } finally {
        setLoading(false);
      }
    };

    if (periode) {
      fetchPerformance();
    }
  }, [periode]); // Re-fetch saat periode (bulan) berubah

  return (
    <>
      <PageMeta title="Evaluasi Kompetensi | Sistem Magang Terintegrasi" description="Lihat hasil evaluasi kompetensi" />
      <PageBreadcrumb pageTitle="Evaluasi Kompetensi" />
      
      <div className="space-y-6">
        {/* Filter Periode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Evaluasi Kompetensi</h3>
            <p className="text-xs text-gray-500 italic">Pilih bulan untuk melihat statistik performa.</p>
          </div>
          <input 
            type="month" 
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-600 outline-none"
          />
        </div>

        {/* Struktur Grid diubah menjadi 1 kolom penuh agar menumpuk ke bawah */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Bagian Atas: Visualisasi Jaring */}
          <div className="w-full">
            <ComponentCard title="Visualisasi Jaring">
              {loading ? (
                <div className="h-64 flex items-center justify-center animate-pulse text-gray-400">Menghubungkan ke server...</div>
              ) : performanceData?.chart ? (
                // Wrapper tambahan opsional agar chart tidak terlalu melar di layar desktop yang sangat lebar
                <div className="max-w-3xl mx-auto w-full">
                  <InternRadarChart data={performanceData.chart} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 italic text-sm">
                  Data visualisasi tidak tersedia untuk periode ini.
                </div>
              )}
            </ComponentCard>
          </div>

          {/* Bagian Bawah: Feedback/Detail */}
          <div className="w-full">
            <ComponentCard title="Feedback Mentor">
              {/* max-h dinaikkan menjadi 600px karena layout atas-bawah memberikan ruang vertikal lebih bebas */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {loading ? (
                  <div className="place-items-center">
  <p className="text-gray-400 animate-pulse">Menghubungkan ke server...</p>
</div>
                ) : performanceData?.details?.length > 0 ? (
                  // Responsif grid internal: feedback dipecah jadi 2 kolom di layar besar agar tidak terlalu memanjang ke samping
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {performanceData.details.map((item: any) => (
                      <div key={item.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-brand-600 uppercase tracking-wide">
                              {item.nama_kriteria}
                            </span>
                            <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase ${
                              item.level === 'mahir' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-brand-700'
                            }`}>
                              {item.level}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{item.mengapa_level_ini}"
                          </p>
                        </div>
                        
                        {item.saran_pengembangan && (
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saran Pengembangan:</p>
                             <p className="text-sm text-gray-700 dark:text-gray-300">{item.saran_pengembangan}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-500 italic">Belum ada feedback dari mentor untuk periode ini.</p>
                  </div>
                )}
              </div>
            </ComponentCard>
          </div>

        </div>
      </div>
    </>
  );
}