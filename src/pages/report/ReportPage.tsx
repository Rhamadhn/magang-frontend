import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { logbookService } from "../../api/logbookService";

export default function ReportPage() {
  const [timelineLogs, setTimelineLogs] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);
  
  // Periode default 1 bulan penuh untuk diexport
  const [startDate, setStartDate] = useState(nowMonthStart());
  const [endDate, setEndDate] = useState(nowMonthEnd());

  function nowMonthStart() { return new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10); }
  function nowMonthEnd() { return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substring(0, 10); }

  const loadTimelinePreview = async () => {
    try {
      // Menembak tanpa draw untuk mendapatkan koleksi data kalendar/timeline murni
      const res = await logbookService.getHistoryTable(1, 100, ""); // Ambil kapasitas bulk
      setTimelineLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadTimelinePreview(); }, []);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const res = await logbookService.downloadReportPdf(startDate, endDate);
      
      // Buka aliran file blob hasil download dari Laravel
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Laporan_Magang_Rekap_${startDate}_to_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Gagal mengunduh PDF Laporan.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageMeta title="Laporan Akhir" description="Kompilasi rekapitulasi data magang untuk kampus" />
      <PageBreadcrumb pageTitle="Laporan Akhir" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kontrol Sisi Kiri */}
        <div className="lg:col-span-4 space-y-6">
          <ComponentCard title="Opsi Cetak Laporan">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">Tanggal Mulai:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">Tanggal Selesai:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              
              <Button variant="primary" className="w-full rounded-xl py-3 mt-2" onClick={handleDownloadPdf} disabled={downloading}>
                {downloading ? "Menyusun PDF..." : "Unduh PDF Laporan Resmi"}
              </Button>
            </div>
          </ComponentCard>
        </div>

        {/* Preview Timeline Sisi Kanan */}
        <div className="lg:col-span-8">
          <ComponentCard title="Preview Linimasa Jurnal Aktivitas">
            <div className="relative border-l-2 border-brand-100 dark:border-gray-800 ml-4 pl-6 space-y-8">
              {timelineLogs.length > 0 ? (
                timelineLogs.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Penanda Titik Simpul Vertikal */}
                    <span className="absolute -left-[31px] top-1 bg-brand-500 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 shadow" />
                    <div>
                      <span className="text-xs font-bold text-brand-600 block mb-1">{item.tanggal}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-1">{item.aktivitas}</p>
                      {item.catatan_pengumpulan && (
                        <p className="text-xs text-gray-400 italic bg-gray-50 dark:bg-white/[0.01] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
                          Review Mentor: "{item.catatan_pengumpulan}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">Belum ada riwayat aktivitas harian yang terekam.</p>
              )}
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}