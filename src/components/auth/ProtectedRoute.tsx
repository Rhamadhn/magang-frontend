import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "mentor" | "intern")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Kalau masih loading ngecek localStorage, tampilin layar kosong dulu biar gak kedip
  if (loading) return null; 

  // 1. Jika user belum login, tendang ke halaman Sign In
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 2. Jika role user tidak ada di daftar yang diizinkan, tendang ke Dashboard (atau halaman 404)
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Jika oke, izinkan masuk ke halaman tersebut
  return <>{children}</>;
};

export default ProtectedRoute;