import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode, // 👈 esta es la forma correcta en TS moderno
} from "react";
import { api } from "../api/api"; // axios con baseURL = /api y withCredentials=true

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isSignedIn: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.get("/auth/me"); // cookie HttpOnly llega sola
      // Tu API responde { ok: true, user }
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
      // ignoramos errores de red aquí
    } finally {
      setUser(null);
    }
  };

  // Cargar sesión al montar
  useEffect(() => {
    refresh();
  }, []);

  // Revalidar al volver el foco a la pestaña (útil si se inicia/cierra sesión en otra pestaña)
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isSignedIn: !!user,
    refresh,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook opcional por si lo necesitas en páginas
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Renderiza children solo si HAY sesión (si no, muestra fallback o nada)
export function AuthIsSignedIn({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isSignedIn, loading } = useAuth();
  if (loading) return fallback;
  return isSignedIn ? <>{children}</> : <>{fallback}</>;
}

// Renderiza children solo si NO hay sesión (si sí hay, muestra fallback o nada)
export function AuthIsNotSignedIn({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isSignedIn, loading } = useAuth();
  if (loading) return fallback;
  return !isSignedIn ? <>{children}</> : <>{fallback}</>;
}

export default AuthProvider;