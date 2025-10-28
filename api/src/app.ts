import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// ==========================
// 🧩 Middlewares base
// ==========================
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));

// (Opcional) Permitir peticiones desde tu frontend local o dominio
app.use(
  cors({
    origin: [
      "https://localhost:5173", // ejemplo: frontend en Vite
      "https://localhost",      // backend local HTTPS
    ],
    credentials: true,
  })
);

// ==========================
// 🔍 Endpoints principales
// ==========================
app.get("/api/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// ==========================
// ⚠️ Manejador de errores
// ==========================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Error capturado:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

// ==========================
// 🚀 Exportación
// ==========================
export default app;
