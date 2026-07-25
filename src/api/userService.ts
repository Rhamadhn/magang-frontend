import api from "./axios";

// Intern API

// 1. Tambahkan params untuk DataTables jika perlu, 
// tapi biasanya Yajra sudah handle default GET request.
export const getInterns = () => api.get("/v1/interns?draw=0");

export const createIntern = (data: FormData) => 
  api.post("/v1/interns", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// 2. Gunakan POST untuk update yang mengandung file + Method Spoofing
// Ubah type ID dari string menjadi number agar sinkron dengan state React
export const updateIntern = (id: number, data: FormData) => 
  api.post(`/v1/interns/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// 3. Ubah type ID menjadi number
export const deleteIntern = (id: number) => 
  api.delete(`/v1/interns/${id}`);

export const getMyProfile = () => api.get("/v1/me"); // sesuaikan dengan endpoint Laravel lo (misal /v1/profile atau /v1/me)

// Mentor API
export const getMentors = () => api.get("/v1/mentors?draw=0");
export const createMentor = (data: any) => api.post("/v1/mentors", data);
export const updateMentor = (id: string, data: any) => api.put(`/v1/mentors/${id}`, data);
export const deleteMentor = (id: string) => api.delete(`/v1/mentors/${id}`);