// api/src/app.ts
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// manejador de errores...
export default app;
