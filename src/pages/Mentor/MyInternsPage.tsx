import { useEffect, useState, useMemo } from "react";
import { getMyInterns } from "../../api/plottingService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";
import { InfoIcon } from "../../icons"; 

export default function MyInternsPage() {
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State untuk modal detail
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [notification, setNotification] = useState<{variant: any, title: string, message: string} | null>(null);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const response = await getMyInterns();
      setInterns(response.data.data || []);
    } catch (err) {
      showToast("error", "Gagal", "Gagal mengambil daftar peserta magang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterns(); }, []);

  const showToast = (variant: any, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Logic Search
  const filteredInterns = useMemo(() => {
    return interns.filter(item => 
      item.nama_intern?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim?.includes(searchTerm)
    );
  }, [interns, searchTerm]);

  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
  const currentData = filteredInterns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper untuk generate inisial nama jika foto null
  const getInitialName = (name: string) => {
    if (!name) return "I";
    const words = name.split(" ");
    return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : words[0][0].toUpperCase();
  };

  return (
    <>
      <PageMeta title="Daftar Peserta Magang | Sistem Magang Terintegrasi" description="Halaman daftar peserta magang aktif" />
      <PageBreadcrumb pageTitle="Daftar Peserta Magang" />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Daftar Peserta Magang">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Cari menggunakan nama peserta magang..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Peserta Magang</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">ID Peserta Magang</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Divisi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Mulai Magang</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center text-gray-500 animate-pulse">Menghubungkan ke server...</td></tr>
                ) : currentData.length > 0 ? (
                  currentData.map((intern, index) => (
                    <tr key={intern.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* KONDISIONAL RENDER FOTO PADA TABEL */}
                          {intern.foto ? (
                            <img 
                              src={`${import.meta.env.VITE_STORAGE_URL}/${intern.foto}`}
                              alt={intern.nama_intern} 
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/10">
                              {getInitialName(intern.nama_intern)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-800 dark:text-white/90">{intern.nama_intern}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{intern.nim}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          {intern.divisi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{intern.tanggal_mulai}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => { setSelectedIntern(intern); setDetailModalOpen(true); }} 
                            className="p-2 text-gray-400 hover:text-brand-500 transition-colors"
                          >
                            <InfoIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="p-12 text-center text-gray-400">Belum ada daftar peserta magang aktif.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Halaman {currentPage} dari {totalPages || 1}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                Berikutnya
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* MODERN HORIZONTAL GRID MODAL */}
      <Modal 
        isOpen={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)} 
        className="max-w-[720px] w-full p-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* PANEL KIRI: VISUAL PROFILE SIDE DENGAN FOTO BESAR */}
          <div className="md:col-span-4 bg-gradient-to-b from-brand-500/10 via-brand-500/[0.02] to-transparent p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
            {selectedIntern?.foto ? (
              <img 
                src={selectedIntern.foto} 
                alt={selectedIntern.nama_intern} 
                className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-brand-500/10 border-2 border-white dark:border-gray-800 mb-4 animate-in zoom-in-75 duration-300"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4 text-xl font-bold animate-in zoom-in-75 duration-300">
                {getInitialName(selectedIntern?.nama_intern)}
              </div>
            )}
            <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider line-clamp-2 px-2">
              {selectedIntern?.nama_intern}
            </h4>
            <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-1 bg-brand-500/5 px-2.5 py-0.5 rounded-md">
              {selectedIntern?.nim}
            </p>
          </div>

          {/* PANEL KANAN: DATA STRUKTURAL SIDE */}
          <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Berkas Kartu Peserta Magang</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Sistem Magang Terintegrasi.</p>
                </div>
              </div>

              {/* Grid 2 Kolom untuk Informasi Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <HorizontalDetailItem label="Nama Lengkap" value={selectedIntern?.nama_intern} />
                <HorizontalDetailItem label="ID Peserta Magang" value={selectedIntern?.nim} />
                <HorizontalDetailItem label="Divisi Penempatan" value={selectedIntern?.divisi} />
                <HorizontalDetailItem label="Tanggal Mulai" value={selectedIntern?.tanggal_mulai} />
              </div>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl px-5 text-xs font-semibold" 
                onClick={() => setDetailModalOpen(false)}
              >
                Tutup Dokumen
              </Button>
            </div>
          </div>

        </div>
      </Modal>
    </>
  );
}

// Sub-komponen pendukung dengan struktur layout yang ringkas
function HorizontalDetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-gray-50/60 dark:bg-white/[0.01] border border-gray-100 dark:border-gray-800/80 transition-all hover:border-gray-200 dark:hover:border-gray-700">
      <label className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest mb-1.5">{label}</label>
      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{value || "-"}</p>
    </div>
  );
}