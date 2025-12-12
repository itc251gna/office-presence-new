import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function loginWithGoogle() {
    window.location.href = import.meta.env.VITE_AUTH_URL;
  }

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
          { withCredentials: true }
        );
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
