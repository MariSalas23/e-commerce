// ...imports igual
import { 
  createContext, useContext, useEffect, useRef, useState, type ReactNode,
} from "react";
import { api } from "../api/api";

<<<<<<< HEAD
type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null; // ✅ Nuevo
};
=======
type User = { id: number; name: string; email: string; };
>>>>>>> 1fce0eb8d41ff9f4afbda7a0575303441aafcd12

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  refresh: (immediate?: boolean) => Promise<void>;   // 👈 acepta bandera
  signOut: () => Promise<void>;
  updateAvatar: (avatarDataUrl: string) => Promise<void>; // ✅ Nuevo
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const focusTimer = useRef<number | undefined>(undefined);

  // 👉 factoriza la llamada real a /auth/me para poder "forzarla"
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
<<<<<<< HEAD
    } catch (_) {
      //
=======
    } catch {
      // no tumbar sesión por errores de red
>>>>>>> 1fce0eb8d41ff9f4afbda7a0575303441aafcd12
    } finally {
      if (markLoading || first) setLoading(false);
      initializedRef.current = true;
    }
  };

  // 👇 ahora refresh soporta modo inmediato
  const refresh = async (immediate = false) => {
    if (immediate) {
      await callMe(false);        // sin debounce, y sin spinner global
      return;
    }
    if (focusTimer.current) return;
    focusTimer.current = window.setTimeout(() => {
      focusTimer.current = undefined;
      void callMe(false);
    }, 250) as unknown as number;
  };

  const signOut = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setUser(null);
  };

<<<<<<< HEAD
  // ✅ Subir avatar al backend
  const updateAvatar = async (avatarDataUrl: string) => {
    try {
      await api.patch("/auth/avatar", { avatarDataUrl });
      await callMe(); // ✅ Refrescar datos del usuario
    } catch (err) {
      console.error("Error updating avatar", err);
    }
  };

  useEffect(() => {
    void callMe();
  }, []);
=======
  useEffect(() => { void callMe(true); }, []);
>>>>>>> 1fce0eb8d41ff9f4afbda7a0575303441aafcd12

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
    refresh,                    // 👈 exporta la nueva firma
    signOut,
    updateAvatar, // ✅ Nuevo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

<<<<<<< HEAD
// Guards
=======
// Guards: déjalos como los tienes (si loading, retorna null)
>>>>>>> 1fce0eb8d41ff9f4afbda7a0575303441aafcd12
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
