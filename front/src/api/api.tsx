// front/src/api/api.ts
import axios from "axios";
import type { AxiosRequestHeaders } from "axios";

// === Configuración base ===
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // 🔥 envía y recibe cookies HttpOnly
});

// === Cache sencillo del token CSRF ===
let csrfToken: string | null = null;

// === Función para obtener y guardar el token ===
async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  // Ruta de tu backend: GET /api/csrf-token
  const res = await api.get("/csrf-token", { withCredentials: true });
  csrfToken = res.data?.csrfToken;
  return csrfToken!;
}

// === Interceptor: añade el header X-CSRF-Token automáticamente ===
api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();

  if (["post", "put", "patch", "delete"].includes(method)) {
    try {
      const token = await getCsrfToken();

      // Corrección final de tipado
      const headers = (config.headers ?? {}) as AxiosRequestHeaders;
      headers["X-CSRF-Token"] = token;
      config.headers = headers;
    } catch (err) {
      console.warn("⚠️ No se pudo obtener CSRF token:", err);
    }
  }

  return config;
});