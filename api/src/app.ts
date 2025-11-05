import express, { Request, Response, NextFunction, RequestHandler } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import cors from "cors";
import path from "path"; 
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Si corres detrás de proxy/reverse-proxy (Nginx/Docker/etc.)
app.set("trust proxy", 1);

// ==========================
// Middlewares base
// ==========================
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Helmet con cabeceras endurecidas (incluye CSP y políticas modernas)
app.use(
  helmet({
    // Mantiene recursos cross-origin para estáticos si los necesitas
    crossOriginResourcePolicy: { policy: "same-site" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"], // si no usas inline, quita 'unsafe-inline'
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'", "https:", "data:"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"], // más moderno que X-Frame-Options
        "upgrade-insecure-requests": [], // útil en prod HTTPS
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    hsts: { maxAge: 15552000, includeSubDomains: true }, // 180 días
  })
);

// (Opcional) Permitir peticiones desde tu frontend local o dominio
app.use(
  cors({
    origin: [
      "http://localhost:5173",  // frontend Vite local
      "https://localhost:5173", // por si usas HTTPS en dev
      "http://localhost",       // backend local HTTP
      "https://localhost",      // backend local HTTPS
      "https://tu-dominio.com", // PRODUCCIÓN (ajusta)
    ],
    credentials: true, // necesario porque usas cookie HttpOnly
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-CSRF-Token"],
  })
);

// ==========================
// Protección CSRF basada en cookie
// ==========================
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
}) as unknown as RequestHandler;

app.use(csrfProtection);

// Endpoint para que el front obtenga el token y lo envíe en 'X-CSRF-Token'
app.get("/api/csrf-token", (req: Request, res: Response) => {
  res.json({ csrfToken: (req as any).csrfToken() });
});

// ==========================
// Servir imágenes estáticas
// ==========================
app.use(
  "/images",
  express.static(path.join(process.cwd(), "public", "images"), {
    setHeaders: (res, _path) => {
      res.setHeader("Cache-Control", "public, max-age=86400"); // 1 día
    },
  })
);

// ==========================
// Endpoints principales
// ==========================
app.get("/api/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// ==========================
// Manejador de errores
// ==========================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // Error típico de CSRF cuando falta o es inválido el token
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  console.error("Error capturado:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

// ==========================
// Exportación
// ==========================
export default app;