// src/api/logbookService.ts
import api from "./axios";

export const logbookService = {
  // Ambil data logbook (untuk kalender)
  getLogbooks: (start: string, end: string) => 
    api.get(`/v1/logbook?draw=0`, { params: { start_date: start, end_date: end } }),

  // Simpan logbook (Intern)
  storeLogbook: (formData: FormData) => 
    api.post(`/v1/logbook`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Verifikasi logbook (Mentor)
  // Perhatikan URL: pastikan sesuai dengan route Laravel kamu (logbook/{logbook}/verify atau serupa)
  verifyLogbook: (id: string, data: { status: string; catatan?: string }) => 
    api.put(`/v1/logbook/${id}/verify`, data), 

  getHistoryTable: (page: number, length: number = 10, search: string = "") => {
    return api.get("/v1/logbook", {
      params: {
        draw: page,
        start: (page - 1) * length,
        length: length,
        "search[value]": search,
      },
    });
  },

  // Simpan logbook harian baru
  createLogbook: (data: { tanggal: string; aktivitas: string; tugas_id?: string }) => {
    return api.post("/v1/logbook", data);
  },

  // Download PDF Rekap Laporan Akhir (Mentarget endpoint export)
  downloadReportPdf: (startDate?: string, endDate?: string) => {
    return api.get("/v1/logbook/export-pdf", {
      params: { start_date: startDate, end_date: endDate },
      responseType: "blob", // Menandakan bahwa response berupa file biner PDF
    });
  }
}; 