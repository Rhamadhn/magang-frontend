// 1. IMPORT INSTANCE 'api' LU, BUKAN 'axios' BIASA
import api from "./axios";

export const taskService = {
    // 1. Ambil semua data tugas
    getTugasList: (status?: string) => 
        api.get(`/v1/tugas-list`, { params: { status } }), // baseURL sudah ada /api

    // 2. Mentor membuat tugas baru
    createTugas: (data: any) => 
        api.post(`/v1/tugas`, data),

    // 3. Lihat detail tugas
    getTugasDetail: (id: string | number) => 
        api.get(`/v1/tugas/${id}`),

    // 4. Update tugas
    updateTugas: (id: string | number, data: any) => 
        api.put(`/v1/tugas/${id}`, data),

    // 5. Hapus tugas
    deleteTugas: (id: string | number) => 
        api.delete(`/v1/tugas/${id}`),

    

    // 6. Lihat riwayat pengumpulan
    getSubmissionHistory: (tugasId: string | number) => 
        api.get(`/v1/pengumpulan/${tugasId}/history`),

    // 7. Intern kirim tugas
    submitTugas: (data: any) => 
        api.post(`/v1/tugas/submit`, data),

    // --- LOGBOOK ---
    getLogbookList: () => 
        api.get(`/v1/logbook`),

    // Mentor verifikasi
    verifySubmission: (id: string | number, data: any) => 
        api.patch(`/v1/pengumpulan/${id}/verify`, data),
};