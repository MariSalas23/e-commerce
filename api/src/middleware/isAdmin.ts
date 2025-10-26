import { Request, Response, NextFunction } from "express";

const adminEmails = [
  "administrador@adminarepabuela.com", // ← único admin válido
];

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const u = (req as any).user as { email: string } | undefined;
  const ok = !!u && adminEmails.includes(String(u.email).toLowerCase());
  if (!ok) return res.status(403).json({ error: "Forbidden" });
  next();
}