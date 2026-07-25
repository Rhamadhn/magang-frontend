import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

// 1. Definisikan tipe data user
interface User {
  name: string;
  username: string;
  role: "admin" | "mentor" | "intern";
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 2. Cek apakah ada user yang tersimpan di browser saat pertama kali load
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 3. Fungsi Login (untuk menyimpan data)
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  // 4. Fungsi Logout (untuk menghapus data)
  const logout = async () => {
  try {
    // Beritahu Laravel untuk hapus token di DB
    await api.post("/v1/logout"); 
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    // Apapun hasilnya (sukses/gagal koneksi), bersihkan data di FE
    setUser(null);
    localStorage.removeItem("auth_user");
  }
};

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook kustom agar kita gampang panggil data user di komponen lain
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};