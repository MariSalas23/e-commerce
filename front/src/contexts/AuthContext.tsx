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
  avatar?: string | null; // ✅ avatar desde BD
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  refresh: (immediate?: boolean) => Promise<void>; // Firma de tu compañera
  signOut: () => Promise<void>;
  updateAvatar: (avatarDataUrl: string) => Promise<void>; // Subir avatar (JSON)
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const focusTimer = useRef<number | undefined>(undefined);

  // Factorizamos /auth/me para poder forzarlo
  const callMe = async (markLoading = false) => {
    const first = !initializedRef.current;
    if (markLoading || first) setLoading(true);
    try {
      const res = await api.get("/auth/me", { validateStatus: () => true });
      if (res.status === 200 && res.data?.user) {
        setUser(res.data.user as User);
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
      }
    } catch {
      // no tumbar sesión por errores de red
    } finally {
      if (markLoading || first) setLoading(false);
      initializedRef.current = true;
    }
  };

  // refresh con modo inmediato (sin debounce, sin spinner global)
  const refresh = async (immediate = false) => {
    if (immediate) {
      await callMe(false);
      return;
    }
    if (focusTimer.current) return;
    focusTimer.current = window.setTimeout(() => {
      focusTimer.current = undefined;
      void callMe(false);
    }, 250) as unknown as number;
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
  };

  // Subir avatar con JSON (DataURL) y refrescar de inmediato
  const updateAvatar = async (avatarDataUrl: string) => {
    const res = await api.patch(
      "/auth/avatar",
      { avatarDataUrl },
      { validateStatus: () => true }
    );
    if (res.status !== 200) {
      throw new Error("No se pudo actualizar el avatar");
    }
    await refresh(true);
  };

  // Carga inicial
  useEffect(() => {
    void callMe(true);
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
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Guards
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