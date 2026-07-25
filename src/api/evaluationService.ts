import api from "./axios";

export const evaluationService = {
  // Ambil semua kriteria untuk ditampilkan di form penilaian
  getKriteria: () => api.get("/v1/kriteria"),
  
  // Ambil daftar intern bimbingan mentor
  getMyInterns: () => api.get("/v1/my-interns"),
  
  // Kirim penilaian bulk
  submitBulkEvaluation: (data: { intern_id: string; penilaian: any[] }) => 
    api.post("/v1/evaluasi/bulk", data),
  
  // Lihat riwayat evaluasi intern tertentu
getInternEvaluation: (internId: string, periode?: string) => 
    api.get(`/v1/evaluasi/intern/${internId}`, { 
      params: { periode } // Ini akan mengirim ?periode=2026-05 di URL
    }),

  resetEvaluation: (internId: string) => 
    api.delete(`/v1/evaluasi/${internId}`),
  

  // Ambil ringkasan evaluasi saya sendiri (Intern)
 getMyPerformance: (periode: string) => 
    api.get("/v1/my-evaluation", { params: { periode } }), // Hapus '/' di sebelum v1

  // Jika butuh detail lebih lanjut
  getMyEvaluationDetail: (periode: string) => 
    api.get("/v1/evaluasi/my/detail", { params: { periode } }),
};