import { useEffect, useState, useMemo } from "react";
import { 
  getAllPlotting, 
  assignMentorToIntern, 
  removePlotting, 
  updatePlotting 
} from "../../api/plottingService";
import api from "../../api/axios"; 
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";

import {  
  PencilIcon, 
  TrashBinIcon, 
  PlusIcon,
  InfoIcon,
  HorizontaLDots
} from "../../icons"; 

export default function PlottingPage() {
  const [plottings, setPlottings] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [status, setStatus] = useState("aktif");
  
  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Data States
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [selectedIntern, setSelectedIntern] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  
  // Datatables Logic
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [notification, setNotification] = useState<{variant: any, title: string, message: string} | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resPlot = await getAllPlotting();
      const freshData = resPlot.data?.data || resPlot.data || [];
      setPlottings(freshData); 
      
      // Fetch Dropdown Data (Intern & Mentor)
      const [resIntern, resMentor] = await Promise.all([
        api.get("/v1/interns"), // Sesuaikan endpoint API Anda
        api.get("/v1/mentors")  // Sesuaikan endpoint API Anda
      ]);
      setInterns(resIntern.data?.data || []);
      setMentors(resMentor.data?.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (variant: any, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredPlottings = useMemo(() => {
    return plottings.filter(p => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameIntern = (p.nama_intern || p.intern?.nama || "").toLowerCase();
      const nameMentor = (p.nama_mentor || p.mentor?.nama || "").toLowerCase();
      const nim = (p.nim || "").toLowerCase();
      return nameIntern.includes(searchTermLower) || nameMentor.includes(searchTermLower) || nim.includes(searchTermLower);
    });
  }, [plottings, searchTerm]);

  const totalPages = Math.ceil(filteredPlottings.length / itemsPerPage);
  const currentData = filteredPlottings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenForm = (plot: any = null) => {
    if (plot) {
      setSelectedPlot(plot);
      setStatus(plot.status || "aktif");
      setKeterangan(plot.keterangan || "");
    } else {
      setSelectedPlot(null);
      setSelectedIntern("");
      setSelectedMentor("");
      setTanggalMulai(new Date().toISOString().split('T')[0]);
      setTanggalSelesai("");
      setKeterangan("Penempatan Peserta Magang");
      setStatus("aktif");
    }
    setFormModalOpen(true);
  };

  const handleOpenDelete = (plot: any) => {
    setSelectedPlot(plot);
    setDeleteModalOpen(true);
  };

  const handleOpenDetail = (plot: any) => {
    setSelectedPlot(plot);
    setDetailModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlot) return;
    setIsSubmitting(true);
    try {
      await removePlotting(selectedPlot.id.toString());
      showToast("success", "Relasi Diputuskan", "Hubungan intern dan mentor berhasil dihapus.");
      setDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      setDeleteModalOpen(false);
      showToast("error", "Gagal", "Terjadi kesalahan saat menghapus relasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedPlot) {
        // HANYA UPDATE STATUS DAN KETERANGAN SESUAI SERVICE BACKEND
        const payloadUpdate = { 
          status: status,
          keterangan: keterangan 
        };
        await updatePlotting(selectedPlot.id.toString(), payloadUpdate);
        showToast("success", "Berhasil", "Status plotting diperbarui.");
      } else {
        // LOGIKA INSERT (TETAP SAMA)
        if (!selectedIntern || !selectedMentor) {
            showToast("error", "Validasi", "Intern dan Mentor wajib dipilih.");
            setIsSubmitting(false);
            return;
        }
        const payloadCreate = { 
          intern_id: selectedIntern, 
          mentor_id: selectedMentor,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai || null,
          keterangan: keterangan || "-"
        };
        await assignMentorToIntern(payloadCreate);
        showToast("success", "Berhasil", "Plotting berhasil dibuat.");
      }
      setFormModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Terjadi kesalahan.";
      showToast("error", "Gagal", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Penempatan Pembimbing | Sistem Magang Terintergrasi" description="Manajemen hubungan Peserta Magang dan Mentor" />
      <PageBreadcrumb pageTitle="Penempatan" />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Penempatan Peserta Magang & Mentor">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Cari nama peserta magang atau mentor..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <Button onClick={() => handleOpenForm()} size="sm" className="flex items-center gap-2">
              <PlusIcon /> Tambah Penempatan
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Peserta Magang</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Mentor Pembimbing</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-500 animate-pulse">Menghubungkan ke server...</td></tr>
                ) : currentData.length > 0 ? (
                  currentData.map((plot, index) => (
                    <tr key={plot.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {plot.nama_intern || plot.intern?.nama || "N/A"}
                        <div className="text-xs text-gray-400 font-normal">{plot.nim}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {plot.nama_mentor || plot.mentor?.nama || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 pr-12">
                          <button onClick={() => handleOpenDetail(plot)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Detail">
                            <InfoIcon className="w-5 h-5" />
                          </button>
                          {plot.status !== 'selesai' && (
      <button 
        onClick={() => handleOpenForm(plot)} 
        className="p-2 text-gray-400 hover:text-brand-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-lg" 
        title="Ubah"
      >
        <PencilIcon className="w-5 h-5" />
      </button>
    )}
                          <button onClick={() => handleOpenDelete(plot)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-400">Data tidak ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Halaman {currentPage} dari {totalPages || 1}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Berikutnya</Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* MODAL FORM PLOTTING (INSERT & UPDATE) */}
      <Modal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} className="max-w-[550px] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
             <HorizontaLDots className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedPlot ? "Update Status Penempatan" : "Buat Penempatan Baru"}</h3>
            <p className="text-xs text-gray-500">{selectedPlot ? "Ubah status aktifitas magang" : "Hubungkan Peserta Magang dengan Mentor."}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!selectedPlot ? (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Pilih Peserta Magang</label>
                <select 
                  value={selectedIntern}
                  onChange={(e) => setSelectedIntern(e.target.value)}
                  className="w-full rounded-xl border h-12 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none"
                >
                  <option value="">Pilih Peserta Magang</option>
                  {interns.map((i: any) => <option key={i.id} value={i.id}>{i.nama} ({i.nim})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Pilih Mentor Pembimbing</label>
                <select 
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full rounded-xl border h-12 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none"
                >
                  <option value="">Pilih Mentor</option>
                  {mentors.map((m: any) => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tanggal Mulai</label>
                  <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="w-full rounded-xl border h-12 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
                  <input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="w-full rounded-xl border h-12 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700" />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Status Magang</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border h-12 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">*Jika status 'Selesai', tanggal selesai akan otomatis diset hari ini di server.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Keterangan</label>
            <textarea 
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full rounded-xl border p-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none h-24"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setFormModalOpen(false)} type="button">Batalkan</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Memproses..." : "Simpan Data"}</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETAIL */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} className="max-w-[500px] p-0 overflow-hidden">
  {/* Header Modal dengan Background Accent */}
  <div className="bg-gray-50 dark:bg-white/[0.03] px-8 py-6 border-b border-gray-100 dark:border-gray-800">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
          <InfoIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Informasi Penempatan</h3>
          <p className="text-xs text-gray-500">Detail penempatan peserta magang</p>
        </div>
      </div>
      {/* Status Badge */}
      <span className={`px-3 py-1 pr-12 rounded-full text-xs font-bold uppercase tracking-wider ${
        selectedPlot?.status === 'aktif' 
          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
          : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
      }`}>
        {selectedPlot?.status || 'aktif'}
      </span>
    </div>
  </div>
  
  <div className="p-8 space-y-6">
    {/* Grid Utama */}
    <div className="grid grid-cols-1 gap-6">
      {/* Baris 1: Intern & Mentor */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Peserta Magang</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            {selectedPlot?.nama_intern || selectedPlot?.intern?.nama}
          </p>
          <p className="text-xs text-gray-500">{selectedPlot?.nim || "-"}</p>
        </div>
        <div className="hidden sm:block w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
        <div className="space-y-1 sm:text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mentor Pembimbing</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            {selectedPlot?.nama_mentor || selectedPlot?.mentor?.nama}
          </p>
        </div>
      </div>

      {/* Baris 2: Timeline */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-transparent">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Mulai</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedPlot?.tanggal_mulai ? new Date(selectedPlot.tanggal_mulai).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : "-"}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-transparent">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Selesai</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedPlot?.tanggal_selesai ? new Date(selectedPlot.tanggal_selesai).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : "-"}
          </p>
        </div>
      </div>

      {/* Baris 3: Keterangan */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keterangan Tambahan</p>
        <div className="p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
"{selectedPlot?.keterangan || "Tidak ada keterangan tambahan."}"          </p>
        </div>
      </div>
    </div>

    <Button 
      className="w-full h-12 rounded-xl shadow-lg shadow-gray-200 dark:shadow-none mt-2" 
      variant="outline" 
      onClick={() => setDetailModalOpen(false)}
    >
      Tutup Detail
    </Button>
  </div>
</Modal>

      {/* MODAL DELETE */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-[400px] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-5">
            <TrashBinIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Putuskan Hubungan?</h3>
          <p className="text-sm text-gray-500 mb-8 px-2 leading-relaxed">
            Anda akan menghapus relasi antara <span className="font-bold text-gray-800 dark:text-white">"{selectedPlot?.nama_intern || selectedPlot?.intern?.nama}"</span> dan mentor pembimbingnya.
          </p>
          <div className="flex gap-3 w-full">
            <Button className="flex-1" variant="outline" onClick={() => setDeleteModalOpen(false)}>Kembali</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 border-none text-white shadow-lg shadow-red-500/20" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? "Menghapus..." : "Ya, Putuskan"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}