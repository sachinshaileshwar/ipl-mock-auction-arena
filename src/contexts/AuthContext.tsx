import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      // We want the PROFILE because it has the 'role', which the app needs for routing.
      // The backend returns { user, profile }.
      setUser(res.data.profile);
    } catch (err) {
      console.error("Session check failed", err);
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });
      // Backend returns: { message, user, session: { access_token }, profile }
      const token = res.data.session?.access_token;
      if (token) {
        localStorage.setItem("auth_token", token);
        // Important: Set the PROFILE, not just the raw auth user
        setUser(res.data.profile || res.data.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data || err };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      await api.post("/api/auth/signup", {
        email,
        password,
        username,
      });
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data || err };
    }
  };

  const signOut = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile: user, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
