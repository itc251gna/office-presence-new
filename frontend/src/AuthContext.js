import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as apiLogout } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const u = await getMe();
        if (isMounted) setUser(u);
      } catch (err) {
        if (err.status !== 401 && console) {
          console.error("auth/me error", err);
        }
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    window.location.href = "/login";
  };

  const value = { user, setUser, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
