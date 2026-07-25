import api from "./axios";

// Interface untuk mempermudah maintenance
interface DivisionData {
  nama_divisi: string;
  deskripsi?: string;
}

export const getDivisions = () => api.get("/v1/divisi?draw=0");

// Gunakan nama_divisi sesuai struktur database lo
export const createDivision = (data: DivisionData) => api.post("/v1/divisi", data);

// Ganti id: number menjadi id: string (karena UUID)
export const updateDivision = (id: string, data: DivisionData) => 
  api.put(`/v1/divisi/${id}`, data);

// Ganti id: number menjadi id: string (karena UUID)
export const deleteDivision = (id: string) => 
  api.delete(`/v1/divisi/${id}`);