import React, { useEffect, useState, useMemo } from "react";
import { kriteriaService } from "../../api/kriteriaService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";
import { PencilIcon, TrashBinIcon, PlusIcon, InfoIcon, HorizontaLDots } from "../../icons";

export default function KriteriaPage() {
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Data States
  const [selectedKriteria, setSelectedKriteria] = useState<any>(null);
  const [formData, setFormData] = useState({ nama_kriteria: "", deskripsi_kriteria: "" });
  const [errors, setErrors] = useState<any>({});
  
  // Datatables: Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [notification, setNotification] = useState<{variant: any, title: string, message: string} | null>(null);

  const fetchKriteria = async () => {
    try {
      setLoading(true);
      const res = await kriteriaService.getKriteriaTable();
      setKriteria(res.data.data || []);
    } catch (err) {
      showToast("error", "Gagal", "Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKriteria(); }, []);

  const showToast = (variant: any, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Logic Search & Pagination
  const filteredKriteria = useMemo(() => {
    return kriteria.filter(item => 
      item.nama_kriteria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi_kriteria?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [kriteria, searchTerm]);

  const totalPages = Math.ceil(filteredKriteria.length / itemsPerPage);
  const currentData = filteredKriteria.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenForm = (item: any = null) => {
    setErrors({});
    if (item) {
      setSelectedKriteria(item);
      setFormData({ nama_kriteria: item.nama_kriteria, deskripsi_kriteria: item.deskripsi_kriteria });
    } else {
      setSelectedKriteria(null);
      setFormData({ nama_kriteria: "", deskripsi_kriteria: "" });
    }
    setFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      if (selectedKriteria) {
        await kriteriaService.updateKriteria(selectedKriteria.id, formData);
        showToast("success", "Pembaruan Berhasil", "Informasi kriteria telah diperbarui.");
      } else {
        await kriteriaService.createKriteria(formData);
        showToast("success", "Berhasil Ditambahkan", "Kriteria baru telah berhasil disimpan.");
      }
      setFormModalOpen(false);
      fetchKriteria();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        showToast("error", "Kesalahan Sistem", "Gagal memproses permintaan Anda.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedKriteria) return;
    setIsSubmitting(true);
    try {
      await kriteriaService.deleteKriteria(selectedKriteria.id);
      showToast("success", "Berhasil", "Kriteria berhasil dihapus secara permanen.");
      setDeleteModalOpen(false);
      fetchKriteria();
    } catch (err: any) {
      setDeleteModalOpen(false);
      const msg = err.response?.data?.message || "Data ini sedang digunakan oleh tabel lain dan tidak dapat dihapus.";
      showToast("error", "Gagal Menghapus", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Manajemen Penilaian | Sistem Magang Terintegrasi" description="Manajemen Kriteria Penilaian Intern" />
      <PageBreadcrumb pageTitle="Manajemen Penilaian" />

      {/* TOAST ALERT POSISI KANAN BAWAH */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Kriteria Penilaian Mentor">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau deskripsi..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            
            <Button onClick={() => handleOpenForm()} size="sm" className="flex items-center gap-2">
              <PlusIcon /> Tambah Kriteria
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Nama Kriteria</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Deskripsi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500 animate-pulse">
                      Menghubungkan ke server...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {item.nama_kriteria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.deskripsi_kriteria ? (item.deskripsi_kriteria.length > 50 ? item.deskripsi_kriteria.substring(0, 50) + "..." : item.deskripsi_kriteria) : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedKriteria(item); setDetailModalOpen(true); }} 
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                            title="Detail"
                          >
                            <InfoIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleOpenForm(item)} 
                            className="p-2 text-gray-400 hover:text-brand-500 transition-colors" 
                            title="Ubah"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => { setSelectedKriteria(item); setDeleteModalOpen(true); }} 
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                            title="Hapus"
                          >
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400">
                      Data kriteria tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION: MAKS 5 DATA */}
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Halaman {currentPage} dari {totalPages || 1}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* MODAL FORM */}
      <Modal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} className="max-w-[550px] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
            <HorizontaLDots className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {selectedKriteria ? "Ubah Kriteria" : "Kriteria Baru"}
            </h3>
            <p className="text-xs text-gray-500">Isi informasi di bawah ini untuk mengelola kriteria penilaian.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nama Kriteria</label>
            <input 
              type="text" 
              className={`w-full rounded-xl border h-12 px-4 text-sm bg-transparent outline-none transition-all ${errors.nama_kriteria ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
              value={formData.nama_kriteria}
              onChange={(e) => setFormData({...formData, nama_kriteria: e.target.value})}
              placeholder="Contoh: Kedisiplinan"
            />
            {errors.nama_kriteria && <span className="text-[11px] text-red-500 mt-1 flex items-center gap-1">● {errors.nama_kriteria[0]}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Deskripsi Kriteria</label>
            <textarea 
              className="w-full rounded-xl border p-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 outline-none h-32 focus:border-brand-500 transition-all resize-none"
              value={formData.deskripsi_kriteria}
              onChange={(e) => setFormData({...formData, deskripsi_kriteria: e.target.value})}
              placeholder="Jelaskan apa yang dinilai dari kriteria ini..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setFormModalOpen(false)} type="button">Batalkan</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Kriteria"}</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETAIL */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} className="max-w-[480px] p-8">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <InfoIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Informasi Detail Kriteria</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6 text-center">Detail indikator penilaian yang digunakan oleh Mentor.</p>
          
          <div className="w-full space-y-5">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Nama Kriteria</label>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{selectedKriteria?.nama_kriteria}</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Uraian / Deskripsi</label>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                "{selectedKriteria?.deskripsi_kriteria || "Tidak ada deskripsi tambahan untuk kriteria ini."}"
              </p>
            </div>
          </div>
          <Button className="mt-8 w-full" variant="outline" onClick={() => setDetailModalOpen(false)}>Tutup Jendela</Button>
        </div>
      </Modal>

      {/* MODAL KONFIRMASI DELETE */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-[400px] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-5">
            <TrashBinIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Konfirmasi Penghapusan</h3>
          <p className="text-sm text-gray-500 mb-8 font-normal px-2 leading-relaxed">
            Apakah Anda yakin ingin menghapus kriteria <span className="font-bold text-gray-800 dark:text-white">"{selectedKriteria?.nama_kriteria}"</span>? Data yang sudah dihapus tidak dapat dipulihkan.
          </p>
          
          <div className="flex gap-3 w-full">
            <Button className="flex-1" variant="outline" onClick={() => setDeleteModalOpen(false)}>Batalkan</Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 border-none text-white transition-all shadow-lg shadow-red-500/20" 
              onClick={handleConfirmDelete} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Ya, Hapus Data"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}