import { useAuth } from "../../context/AuthContext"; // Sesuaikan path AuthContext lu
import InternDashboard from "./InternDashboard";
import MentorDashboard from "./MentorDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Home() {
  const { user } = useAuth(); // Ambil data user yang login

  // Membaca role user (pastikan di database/auth state lu ada property role)
  switch (user?.role?.toLowerCase()) {
    case "intern":
    case "mahasiswa":
      return <InternDashboard />;
      
    case "mentor":
    case "pembimbing":
      return <MentorDashboard />;
      
    case "admin":
    case "koordinator":
      return <AdminDashboard />;
      
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500 font-medium">Memuat halaman dashboard...</p>
        </div>
      );
  }
}