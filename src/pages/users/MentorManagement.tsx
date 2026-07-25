import { useEffect, useState, useMemo, useCallback } from "react";
import { 
  getMentors, 
  createMentor, 
  updateMentor, 
  deleteMentor 
} from "../../api/userService";
import { getDivisions } from "../../api/divisionService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";
import FileInput from "../../components/form/form-elements/FileInputExample";

import { 
  PencilIcon, 
  TrashBinIcon, 
  PlusIcon, 
  InfoIcon, 
  HorizontaLDots,
  UserCircleIcon,
  SearchIcon,
} from "../../icons";

interface MentorForm {
  nama: string;
  username: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  no_telp: string;
  divisi_id: string;
  foto: File | null;
}

export default function MentorManagement() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Data States
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<MentorForm>({
    nama: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    no_telp: "+62",
    divisi_id: "",
    foto: null
  });
  
  const [errors, setErrors] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [notification, setNotification] = useState<{variant: any, title: string, message: string} | null>(null);

  const showToast = (variant: any, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [mentorRes, divisionRes] = await Promise.all([getMentors(), getDivisions()]);
      setMentors(mentorRes.data.data || []);
      setDivisions(divisionRes.data.data || []);
    } catch (err) {
      showToast("error", "Koneksi Gagal", "Gagal mengambil data dari server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("error", "File Terlalu Besar", "Ukuran maksimal foto adalah 2MB.");
        return;
      }
      setFormData({ ...formData, foto: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenForm = (mentor: any = null) => {
    setErrors({});
    if (mentor) {
      setSelectedMentor(mentor);
      // Sinkronisasi preview dengan path storage dari backend
      setPreviewImage(mentor.foto ? `${import.meta.env.VITE_STORAGE_URL}/${mentor.foto}` : null);
      setFormData({
        nama: mentor.nama || "",
        username: mentor.username || "",
        email: mentor.email || "",
        password: "",
        password_confirmation: "",
        no_telp: mentor.no_telp || "+62",
        divisi_id: mentor.divisi_id || "",
        foto: null
      });
    } else {
      setSelectedMentor(null);
      setPreviewImage(null);
      setFormData({
        nama: "", username: "", email: "", password: "",
        password_confirmation: "", no_telp: "+62", divisi_id: "", foto: null
      });
    }
    setFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!selectedMentor && !formData.password) {
        setErrors({ password: ["Password wajib diisi untuk mentor baru."] });
        return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
        setErrors({ password_confirmation: ["Konfirmasi password tidak sesuai."] });
        return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("nama", formData.nama);
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("no_telp", formData.no_telp);
      data.append("divisi_id", formData.divisi_id);
      
      if (formData.password) {
        data.append("password", formData.password);
        data.append("password_confirmation", formData.password_confirmation || "");
      }

      if (formData.foto) {
        data.append("foto", formData.foto);
      }

      if (selectedMentor) {
        data.append("_method", "PATCH"); // Gunakan PATCH/PUT method spoofing untuk file upload laravel
        await updateMentor(selectedMentor.id, data);
        showToast("success", "Pembaruan Berhasil", "Profil mentor telah diperbarui.");
      } else {
        await createMentor(data);
        showToast("success", "Registrasi Berhasil", "Mentor baru telah ditambahkan.");
      }
      
      fetchData();
      setFormModalOpen(false);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        showToast("error", "Sistem Error", "Gagal memproses data. Silahkan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMentor) return;
    setIsSubmitting(true);
    try {
      await deleteMentor(selectedMentor.id);
      showToast("success", "Terhapus", "Akun mentor berhasil dihapus.");
      setDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      setDeleteModalOpen(false);
      const msg = err.response?.data?.message || "Data gagal dihapus karena masih digunakan.";
      showToast("error", "Gagal", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMentors = useMemo(() => {
    return mentors.filter(m => 
      m.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mentors, searchTerm]);

  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);
  const currentData = filteredMentors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <PageMeta title="Manajemen Pengguna | Sistem Magang Terintegrasi" description="Master data pembimbing lapangan" />
      <PageBreadcrumb pageTitle="Manajemen Pengguna" />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Daftar Pembimbing Lapangan (Mentor)">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama mentor..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <Button onClick={() => handleOpenForm()} size="sm" className="flex items-center gap-2">
              <PlusIcon /> Tambah Mentor
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">No</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Profil Mentor</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Divisi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-gray-500 animate-pulse">Menghubungkan ke server...</td></tr>
                ) : currentData.length > 0 ? (
                  currentData.map((m, index) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200">
                             {m.foto ? (
                               <img src={`${import.meta.env.VITE_STORAGE_URL}/${m.foto}`} className="w-full h-full object-cover" alt="profile"/>
                             ) : (
                               <UserCircleIcon className="w-7 h-7 text-gray-300" />
                             )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{m.nama}</p>
                            <p className="text-xs text-gray-500">@{m.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600 text-[10px] font-bold dark:bg-brand-500/10 uppercase">
                          {m.divisi || "Umum"} {/* MATCH: Menyesuaikan properti string langsung dari API */}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{m.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setSelectedMentor(m); setDetailModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><InfoIcon className="w-5 h-5" /></button>
                          <button onClick={() => handleOpenForm(m)} className="p-2 text-gray-400 hover:text-brand-500 transition-colors"><PencilIcon className="w-5 h-5" /></button>
                          <button onClick={() => { setSelectedMentor(m); setDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashBinIcon className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-12 text-center text-gray-400">Belum ada data mentor.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase">Total {filteredMentors.length} Mentor</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === page ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Berikutnya</Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* FORM MODAL */}
      <Modal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} className="max-w-[900px] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
                <HorizontaLDots className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedMentor ? "Perbarui Mentor" : "Mentor Baru"}</h3>
                <p className="text-xs text-gray-500">Silahkan isi informasi data diri mentor.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text" required value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.nama ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                  />
                  {errors.nama && <p className="text-[10px] text-red-500 mt-1">{errors.nama[0]}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Username</label>
                  <input
                    type="text" required value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.username ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                  />
                  {errors.username && <p className="text-[10px] text-red-500 mt-1">{errors.username[0]}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Divisi</label>
                  <select 
                    required value={formData.divisi_id}
                    onChange={(e) => setFormData({...formData, divisi_id: e.target.value})}
                    className="w-full rounded-xl border h-11 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 focus:border-brand-500 text-gray-700 dark:text-gray-200"
                  >
                    <option value="" className="text-gray-400">Pilih Divisi</option>
                    {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Email Kantor</label>
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-xl border h-11 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 focus:border-brand-500"
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email[0]}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">No. Telp</label>
                  <input
                    type="text" value={formData.no_telp}
                    onChange={(e) => setFormData({...formData, no_telp: e.target.value})}
                    className="w-full rounded-xl border h-11 px-4 text-sm bg-transparent border-gray-200 dark:border-gray-700 focus:border-brand-500"
                  />
                </div>
                
                {/* INPUT PASSWORD */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Password {selectedMentor && "(Opsional)"}</label>
                  <input
                    type="password" placeholder="••••••••" value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                  />
                  {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password[0]}</p>}
                </div>

                {/* FIX: INPUT CONFIRM PASSWORD KINI SUDAH DI-RENDER */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Konfirmasi Password</label>
                  <input
                    type="password" placeholder="••••••••" value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                    className={`w-full rounded-xl border h-11 px-4 text-sm bg-transparent outline-none transition-all ${errors.password_confirmation ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'}`}
                  />
                  {errors.password_confirmation && <p className="text-[10px] text-red-500 mt-1">{errors.password_confirmation[0]}</p>}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                <Button variant="outline" onClick={() => setFormModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </form>
          </div>

          <div className="w-full md:w-[320px] bg-gray-50 dark:bg-white/[0.02] p-8 flex flex-col items-center justify-center border-l border-gray-100 dark:border-gray-800">
            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-6">Foto Profil</label>
            <div className="relative group w-48 h-48 mb-6">
              <div className="w-full h-full rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900 shadow-inner">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-16 h-16 text-gray-200" />
                )}
              </div>
              <div className="absolute inset-0 bg-brand-600/60 opacity-0 group-hover:opacity-100 transition-all rounded-3xl flex items-center justify-center cursor-pointer">
                <div className="relative text-center text-white p-4">
                   <p className="text-[10px] font-bold uppercase">Klik untuk Ganti</p>
                   <FileInput onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 italic text-center">Formal, Rasio 1:1, Maks 2MB.</p>
          </div>
        </div>
      </Modal>

      {/* MODAL DETAIL */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} className="max-w-[700px] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-[280px] bg-gray-50 dark:bg-white/[0.02] p-8 flex flex-col items-center justify-center border-r border-gray-100 dark:border-gray-800">
            <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl mb-4">
              {selectedMentor?.foto ? (
                <img src={`${import.meta.env.VITE_STORAGE_URL}/${selectedMentor.foto}`} className="w-full h-full object-cover" alt="profile"/>
              ) : (
                <UserCircleIcon className="w-full h-full text-gray-200" />
              )}
            </div>
            <span className="px-3 py-1 rounded-full bg-brand-500 text-white text-[10px] font-bold uppercase">
              {selectedMentor?.divisi || "Umum"}
            </span>
          </div>
          
          <div className="flex-1 p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedMentor?.nama}</h3>
            <p className="text-brand-500 font-medium text-sm mb-6">@{selectedMentor?.username}</p>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Email Kantor", value: selectedMentor?.email },
                { label: "Nomor Telepon", value: selectedMentor?.no_telp || "-" },
                { label: "Status", value: "Aktif" },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
                   <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">{item.label}</label>
                   <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.value}</p>
                </div>
              ))}
            </div>
            <Button className="mt-8 w-full" variant="outline" onClick={() => setDetailModalOpen(false)}>Tutup</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL DELETE */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-[400px] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-5">
            <TrashBinIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Hapus Mentor?</h3>
          <p className="text-sm text-gray-500 mb-8 px-4">
            Menghapus <span className="font-bold text-gray-800 dark:text-gray-200">"{selectedMentor?.nama}"</span> akan menghilangkan akses login mereka.
          </p>
          <div className="flex gap-3 w-full">
            <Button className="flex-1" variant="outline" onClick={() => setDeleteModalOpen(false)}>Batal</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? "Hapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}