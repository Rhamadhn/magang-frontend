import api from "./axios";

export const kriteriaService = {
  // Ambil data untuk tabel (Yajra)
  getKriteriaTable: () => api.get("/v1/kriteria"),
  
  // Simpan kriteria baru
  createKriteria: (data: { nama_kriteria: string; deskripsi_kriteria: string }) => 
    api.post("/v1/kriteria", data),
    
  // Update kriteria
  updateKriteria: (id: string, data: any) => api.put(`/v1/kriteria/${id}`, data),
    
  // Hapus kriteria
  deleteKriteria: (id: string) => 
    api.delete(`/v1/kriteria/${id}`),
};