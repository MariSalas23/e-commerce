import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";

const app = express();

// middlewares existentes
app.use(express.json());
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);

// ⬇️ manejador de errores (último middleware)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

export default app;