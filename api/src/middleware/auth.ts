import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";
const COOKIE_NAME = process.env.COOKIE_NAME || "access_token";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = verifyJwt<{ userId: number; email: string }>(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  (req as any).user = payload;
  next();
}
