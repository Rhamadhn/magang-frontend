import { useEffect, useState, useMemo, useRef } from "react";
import { getInterns, createIntern, deleteIntern, updateIntern } from "../../api/userService";
import { getDivisions } from "../../api/divisionService";
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
  HorizontaLDots, 
  // PhotoIcon 
} from "../../icons";

export default function InternManagement() {
  // API Data States
  const [interns, setInterns] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI States
  const [notification, setNotification] = useState<{variant: any, title: string, message: string} | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form & Validation States
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    nim: "",
    nama: "",
    divisi_id: "",
    no_telp: "",
    alamat: ""
  });
  
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Functions ---

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const res = await getInterns();
      // Menyesuaikan dengan Yajra atau standard API response
      const data = res.data.data || res.data;
      setInterns(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("error", "Koneksi Gagal", "Gagal mengambil data intern dari server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await getDivisions();
      setDivisions(res.data.data || res.data);
    } catch (err) {
      console.error("Gagal memuat divisi");
    }
  };

  useEffect(() => {
    fetchInterns();
    fetchDivisions();
  }, []);

  const showToast = (variant: any, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenForm = (intern: any = null) => {
    setErrors({});
    setFotoFile(null);
    if (intern) {
      setSelectedId(intern.id);
      setFormData({
        username: intern.username || "",
        email: intern.email || "",
        password: "",
        password_confirmation: "",
        nim: intern.nim || "",
        nama: intern.nama || "",
        divisi_id: intern.divisi_id || "",
        no_telp: intern.no_telp || "",
        alamat: intern.alamat || ""
      });
      // Jika ada foto dari server, tampilkan di preview
      setFotoPreview(intern.foto ? `${import.meta.env.VITE_STORAGE_URL}/${intern.foto}` : null);
    } else {
      setSelectedId(null);
      setFormData({
        username: "", email: "", password: "", password_confirmation: "",
        nim: "", nama: "", divisi_id: "", no_telp: "", alamat: ""
      });
      setFotoPreview(null);
    }
    setFormModalOpen(true);
  };

  const handleOpenDetail = (intern: any) => {
    setSelectedIntern(intern);
    setDetailModalOpen(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+62")) {
      // Jika user menghapus prefix atau mulai ngetik angka biasa
      value = "+62" + value.replace(/^\+62|^0/, "");
    }
    setFormData({ ...formData, no_telp: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const data = new FormData();
    // Append data text
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "") data.append(key, value);
    });
    
    // Append file jika ada
    if (fotoFile) {
      data.append("foto", fotoFile);
    }

    // Spoofing PUT method untuk Laravel Multipart
    if (selectedId) {
      data.append("_method", "PUT");
    }

    try {
      if (selectedId) {
        await updateIntern(selectedId, data);
        showToast("success", "Pembaruan Berhasil", "Data intern telah diperbarui.");
      } else {
        await createIntern(data);
        showToast("success", "Registrasi Berhasil", "Akun intern baru telah dibuat.");
      }
      setFormModalOpen(false);
      fetchInterns();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        showToast("error", "Kesalahan Sistem", "Gagal memproses permintaan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const confirmDelete = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      await deleteIntern(selectedId);
      showToast("success", "Dihapus", "Data intern berhasil dihapus.");
      setDeleteModalOpen(false);
      fetchInterns();
    } catch (err) {
      showToast("error", "Gagal", "Data gagal dihapus.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Logic Search & Pagination ---
  const filteredInterns = useMemo(() => {
    return interns.filter(i => 
      i.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.nim?.includes(searchTerm)
    );
  }, [interns, searchTerm]);

  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
  const currentData = filteredInterns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <PageMeta title="Manajemen Pengguna | Sistem Magang Terintegrasi" description="Pengaturan peserta magang" />
      <PageBreadcrumb pageTitle="Manajemen Pengguna" />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Daftar Peserta Magang (Intern)">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Cari berdasarkan nama peserta magang..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>
            <Button onClick={() => handleOpenForm()} size="sm" className="flex items-center gap-2">
              <PlusIcon /> Tambah Peserta Magang
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">ID Peserta Magang</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Nama</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-gray-500 animate-pulse">Menghubungkan ke server...</td></tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4 text-sm font-mono text-brand-600">{item.nim}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenDetail(item)} className="p-2 text-gray-400 hover:text-blue-500"><InfoIcon className="w-5 h-5" /></button>
                          <button onClick={() => handleOpenForm(item)} className="p-2 text-gray-400 hover:text-brand-500 transition-colors">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => { setSelectedId(item.id); setDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-12 text-center text-gray-400">Data tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase">Halaman {currentPage} dari {totalPages || 1}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Berikutnya</Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} className="max-w-[800px] p-0 overflow-hidden rounded-3xl">
  <div className="flex flex-col md:flex-row">
    {/* SISI KIRI: FOTO & IDENTITAS UTAMA */}
    <div className="w-full md:w-1/3 bg-gray-50 dark:bg-white/[0.02] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
      <div className="relative">
        <div className="w-32 h-40 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border-4 border-white dark:border-gray-900">
          {selectedIntern?.foto ? (
            <img 
  src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${selectedIntern.foto}`} 
  className="w-full h-full object-cover" 
  alt="Profil"
/>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-200">
               <InfoIcon className="w-12 h-12" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900" title="Aktif"></div>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">{selectedIntern?.nama}</h3>
        <p className="text-xs font-mono text-brand-500 mt-1 uppercase tracking-wider">ID: {selectedIntern?.nim}</p>
      </div>
    </div>

    {/* SISI KANAN: DETAIL INFORMASI */}
    <div className="flex-1 p-8 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Informasi Peserta Magang</h4>
          <p className="text-xs text-gray-500">Detail data diri dan penempatan magang.</p>
        </div>
        {/* <span className="px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 text-[10px] font-bold rounded-full uppercase">
          Internship Project
        </span> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Divisi Penempatan</label>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {/* Cek nested object division */}
            {selectedIntern?.nama_divisi || selectedIntern?.divisi?.nama_divisi || "Belum Ditentukan"}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Kontak WhatsApp</label>
          <p className="text-sm font-semibold text-green-600">
            {selectedIntern?.no_telp || "-"}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Email</label>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {selectedIntern?.email}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Username Sistem</label>
          <p className="text-sm font-semibold text-gray-500 italic">
            @{selectedIntern?.username}
          </p>
        </div>

        <div className="col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Domisili</label>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {selectedIntern?.alamat || "Alamat belum dilengkapi di profil."}
          </p>
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <Button 
          className="flex-1 h-11" 
          variant="outline" 
          onClick={() => setDetailModalOpen(false)}
        >
          Tutup
        </Button>
      </div>
    </div>
  </div>
</Modal>

      {/* --- MODAL FORM (HORIZONTAL LAYOUT) --- */}
      <Modal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} className="max-w-[950px] p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
             <HorizontaLDots className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedId ? "Ubah Data Intern" : "Tambah Peserta Magang Baru"}</h3>
            <p className="text-xs text-gray-500 font-medium">Lengkapi informasi identitas dan akun peserta magang.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          {/* SISI KIRI: DATA INPUT */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Username</label>
              <input 
                type="text" 
                placeholder="Contoh: budi_tech"
                className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.username ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
              {errors.username && <p className="text-[10px] text-red-500 mt-1">● {errors.username[0]}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Email Aktif</label>
              <input 
                type="email" 
                placeholder="contoh@email.com"
                className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">● {errors.email[0]}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">NIM/NIS (ID Peserta Magang)</label>
              <input 
                type="text" 
                className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.nim ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                value={formData.nim}
                onChange={e => setFormData({...formData, nim: e.target.value})}
              />
              {errors.nim && <p className="text-[10px] text-red-500 mt-1">● {errors.nim[0]}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nama Lengkap</label>
              <input 
                type="text" 
                placeholder="Contoh: Budi Setiawan"
                className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.nama ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
              />
              {errors.nama && <p className="text-[10px] text-red-500 mt-1">● {errors.nama[0]}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">No. Telp (WhatsApp)</label>
              <input 
                type="text" 
                placeholder="+628..."
                className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.no_telp ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                value={formData.no_telp}
                onChange={handlePhoneChange} 
              />
              {errors.no_telp && <p className="text-[10px] text-red-500 mt-1">● {errors.no_telp[0]}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Divisi Penempatan</label>
              <select 
                className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.divisi_id ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                value={formData.divisi_id}
                onChange={e => setFormData({...formData, divisi_id: e.target.value})}
              >
                <option value="">Pilih Divisi</option>
                {divisions.map((div: any) => (
                  <option key={div.id} value={div.id}>{div.nama_divisi}</option>
                ))}
              </select>
              {errors.divisi_id && <p className="text-[10px] text-red-500 mt-1">● {errors.divisi_id[0]}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Password {selectedId && <span className="text-[9px] lowercase font-normal">(Kosongkan jika tidak diubah)</span>}
              </label>
              <input 
                type="password" 
                className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              {errors.password && <p className="text-[10px] text-red-500 mt-1">● {errors.password[0]}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Konfirmasi Password</label>
              <input 
                type="password" 
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 h-11 px-4 text-sm bg-transparent outline-none focus:border-brand-500 transition-all"
                onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Alamat Domisili</label>
              <textarea 
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm bg-transparent outline-none focus:border-brand-500 transition-all resize-none h-20"
                value={formData.alamat}
                placeholder="Alamat domisili saat ini"
                onChange={e => setFormData({...formData, alamat: e.target.value})}
              />
            </div>
          </div>

          {/* SISI KANAN: FOTO PREVIEW & ACTION */}
          <div className="w-full md:w-64 flex flex-col items-center">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center w-full">Foto Profil</label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-48 h-60 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-brand-500 transition-all bg-gray-50 dark:bg-white/[0.02]"
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-brand-500 transition-colors">
                  {/* <PhotoIcon className="w-12 h-12 mb-2 opacity-20" /> */}
                  <p className="text-[10px] font-medium uppercase tracking-tight">Pilih Foto</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-bold">Ganti Foto</span>
              </div>
            </div>
            
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {errors.foto && <p className="text-[10px] text-red-500 mt-2 text-center">● {errors.foto[0]}</p>}
            
            <p className="text-[10px] text-gray-400 mt-4 text-center leading-relaxed">Format: JPG, JPEG, PNG.<br/>Maksimal ukuran file 2MB.</p>

            <div className="mt-auto w-full space-y-3 pt-8">
              <Button className="w-full h-12" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Simpan Data"}
              </Button>
              <Button variant="outline" className="w-full h-12" onClick={() => setFormModalOpen(false)}>
                Batalkan
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* --- MODAL DELETE --- */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-[400px] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-5">
            <TrashBinIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Hapus Data Intern?</h3>
          <p className="text-sm text-gray-500 mt-2 mb-8">Tindakan ini akan menghapus akun dan profil peserta magang secara permanen.</p>
          <div className="flex gap-3 w-full">
            <Button className="flex-1" variant="outline" onClick={() => setDeleteModalOpen(false)}>Batal</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 border-none text-white shadow-lg shadow-red-500/20" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? "..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}