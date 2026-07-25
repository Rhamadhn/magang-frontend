import api from "./axios";

// Hilangkan spasi liar
export const getAllPlotting = () => api.get("/v1/plotting?draw=0");

export const assignMentorToIntern = (data: any) => 
  api.post("/v1/plotting", data);

export const updatePlotting = (id: string, data: any) =>
  api.put(`/v1/plotting/${id}`, data);

export const removePlotting = (id: string) => {
  return api.delete(`/v1/plotting/${id}`); 
};

export const getMyInterns = async () => {
  // Sesuai dengan route: api/v1/plotting/get-interns-by-mentor (atau sesuaikan dengan route asli)
  return await api.get("/v1/my-interns"); 
};