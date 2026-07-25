import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function SignInForm() {
  // --- STATES ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // SOLUSI: State yang tadi hilang
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- LOGIC: HANDLE LOGIN ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
    setError("Username dan password tidak boleh kosong di sistem.");
    return;
  }
    setLoading(true);

    try {
      const response = await api.post("/login", { 
        username: username.trim(), 
        password: password.trim()
       });
      
      const { user, token } = response.data.data; 

      login({
        name: user.name,
        username: user.username,
        role: user.role, 
        token: token,
      });

      navigate("/"); 
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(err.response.data.message || "Username atau password salah.");
      } else {
        setError("Koneksi ke server gagal. Pastikan API Laravel sudah berjalan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      {/* HEADER SECTION */}
      <header className="mb-5 sm:mb-8 text-center sm:text-left">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Sign In
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Silakan masukkan Username dan Password Anda.
        </p>
      </header>

      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <svg className="size-4 shrink-0 fill-current" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
          {error}
        </div>
      )}

      {/* FORM SECTION */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* USERNAME FIELD */}
        <div className="space-y-2">
          <Label>Username <span className="text-error-500">*</span></Label>
          <Input
            type="text"
            name="username"          
            id="username"
            autoComplete="username"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD FIELD */}
        <div className="space-y-2">
          <Label>Password <span className="text-error-500">*</span></Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"          
      id="password"                
      autoComplete="current-password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Pastikan ini setPassword!
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              {showPassword ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="#!" className="text-sm font-medium text-brand-500 hover:underline">
              Lupa password?
            </Link>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <Button 
          type="submit" 
          className="w-full" 
          size="sm" 
          disabled={loading}
        >
          {loading ? "Memproses..." : "Sign In"}
        </Button>
      </form>

      {/* FOOTER SECTION */}
      <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Belum punya akun? <br />
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            Hubungi Admin untuk pendaftaran akun magang.
          </span>
        </p>
      </footer>
    </div>
  );
}