import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  loading: boolean; // solo primera carga
  isSignedIn: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const focusTimer = useRef<number | undefined>(undefined);

  const callMe = async () => {
    const first = !initializedRef.current;
    if (first) setLoading(true);

    try {
      const res = await api.get("/auth/me", { validateStatus: () => true });

      if (res.status === 200 && res.data?.user) {
        setUser(res.data.user as User);
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
      }
      // si hay 500s, no cerramos sesión
    } catch (_) {
      // errores de red: NO tumbar la sesión
    } finally {
      if (first) {
        setLoading(false);
        initializedRef.current = true;
      }
    }
  };

  const refresh = async () => {
    if (focusTimer.current) return;
    focusTimer.current = window.setTimeout(() => {
      focusTimer.current = undefined;
      void callMe();
    }, 250) as unknown as number;
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
  };

  // Carga inicial
  useEffect(() => {
    void callMe();
  }, []);

  // Refresh al volver a la pestaña
  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const adminEmails = ["administrador@adminarepabuela.com"];
  const isAdmin = !!user && adminEmails.includes(user.email.toLowerCase());

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

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ---- Guards mejorados ----

// SOLO RENDERIZAR CUANDO NO ESTAMOS CARGANDO
export function AuthIsSignedIn({ children, fallback = null }: any) {
  const { isSignedIn, loading } = useAuth();
  if (loading) return null;
  return isSignedIn ? <>{children}</> : <>{fallback}</>;
}

export function AuthIsNotSignedIn({ children, fallback = null }: any) {
  const { isSignedIn, loading } = useAuth();
  if (loading) return null;
  return !isSignedIn ? <>{children}</> : <>{fallback}</>;
}

export function AdminOnly({ children, fallback = null }: any) {
  const { isAdmin, isSignedIn, loading } = useAuth();
  if (loading) return null;
  if (!isSignedIn || !isAdmin) return <>{fallback}</>;
  return <>{children}</>;
}

export default AuthProvider;