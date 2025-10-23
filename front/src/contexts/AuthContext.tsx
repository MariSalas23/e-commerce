import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/api";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me"); // cookie HttpOnly via withCredentials
      if (res?.data?.ok && res?.data?.user) setUser(res.data.user as User);
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore error
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Lógica de admin (puedes dejar solo por email si quieres)
  const adminEmails = ["administrador@adminarepabuela.com"]; // en minúsculas
  const isAdmin =
    !!user &&
    (adminEmails.includes(user.email.toLowerCase()));

  const value: AuthContextType = {
    user,
    loading,
    isSignedIn: !!user,
    isAdmin,
    refresh,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para consumir el contexto
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// --------- Wrappers de visibilidad ---------

// Muestra children solo si HAY sesión (si no, muestra fallback)
export function AuthIsSignedIn({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isSignedIn, loading } = useAuth();
  if (loading) return <>{fallback}</>;
  return isSignedIn ? <>{children}</> : <>{fallback}</>;
}

// Muestra children solo si NO hay sesión (si sí hay, muestra fallback)
export function AuthIsNotSignedIn({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isSignedIn, loading } = useAuth();
  if (loading) return <>{fallback}</>;
  return !isSignedIn ? <>{children}</> : <>{fallback}</>;
}

// Solo para admins (si no cumple, muestra fallback)
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { loading, isSignedIn, isAdmin } = useAuth();
  if (loading) return <>{fallback}</>;
  if (!isSignedIn || !isAdmin) return <>{fallback}</>;
  return <>{children}</>;
}

export default AuthProvider;