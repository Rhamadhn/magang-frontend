import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Masuk | Sistem Magang Terintegrasi"
        description="Halaman masuk resmi Sistem Magang Terintegrasi. Akses dasbor Anda untuk melihat daftar tugas, posisi magang, dan laporan evaluasi."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
