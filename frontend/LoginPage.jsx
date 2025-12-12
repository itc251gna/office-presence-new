import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={loginWithGoogle}
        className="rounded-md bg-slate-900 text-white px-4 py-2"
      >
        Σύνδεση με Google
      </button>
    </div>
  );
}
