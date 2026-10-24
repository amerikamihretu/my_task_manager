import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/auth/me");
        if (!cancelled) setUser(res.data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }

  async function updateProfile(name, avatarFile) {
    const body = new FormData();
    body.append("name", name);
    if (avatarFile) body.append("avatar", avatarFile);
    const res = await api.patch("/auth/profile", body);
    setUser(res.data.user);
    return res.data.user;
  }

  async function removeAvatar() {
    const res = await api.delete("/auth/profile/avatar");
    setUser(res.data.user);
    return res.data.user;
  }

  async function changePassword(currentPassword, newPassword) {
    return api.post("/auth/password", { currentPassword, newPassword });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        removeAvatar,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
