import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Sesuaikan dengan URL Laravel lo
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor untuk menyisipkan Token otomatis jika ada di localStorage
api.interceptors.request.use((config) => {
  
  // ====================================================================
  // FIX UNTUK UPLOAD FILE (FORMDATA)
  // Jika payload data yang dikirim adalah FormData, hapus Content-Type bawaan 
  // agar browser otomatis menggunakan multipart/form-data beserta boundary-nya.
  // ====================================================================
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  // SOLUSI: Jika tujuannya adalah route login, JANGAN KIRIM TOKEN LAMA
  if (config.url?.includes("/login")) {
    if (config.headers) {
      delete config.headers.Authorization; // Hapus paksa jika ada sisa token mendem
    }
    return config;
  }

  // Untuk route selain login, silakan ambil token seperti biasa
  const authData = localStorage.getItem("auth_user");
  if (authData) {
    try {
      const { token } = JSON.parse(authData);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Gagal membaca token lama:", error);
    }
  }
  
  return config;
});

export default api;