import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signJwt } from "../utils/jwt.js";

const COOKIE_NAME = process.env.COOKIE_NAME || "access_token";
const SECURE = String(process.env.COOKIE_SECURE || "true") === "true";
const SAME_SITE = (process.env.COOKIE_SAMESITE || "strict") as "lax" | "strict" | "none";
const MAX_AGE = Number(process.env.COOKIE_MAX_AGE_MS || 30 * 24 * 60 * 60 * 1000);

const registerSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Contraseña muy corta (mín. 6)")
});

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Contraseña muy corta (mín. 6)")
});

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message || "Datos inválidos";
      return res.status(400).json({ error: first });
    }
    const { name, email, password } = parsed.data;

    const exists = await query<{ id: number }>("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) return res.status(409).json({ error: "El correo ya está registrado" });

    const password_hash = await hashPassword(password);

    // Clave: crear usuario como NO aprobado
    const inserted = await query<{ id: number }>(
      `INSERT INTO users(name,email,password_hash,approved)
       VALUES($1,$2,$3,false)
       RETURNING id`,
      [name, email, password_hash]
    );

    const userId = inserted.rows[0].id;

    // NO seteamos cookie ni JWT; queda pendiente
    return res.status(201).json({
      ok: true,
      pending: true,
      user: { id: userId, name, email }
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message || "Datos inválidos";
      return res.status(400).json({ error: first });
    }
    const { email, password } = parsed.data;

    const result = await query<{
      id: number; name: string; password_hash: string; approved: boolean;
    }>(
      "SELECT id, name, password_hash, approved FROM users WHERE email=$1",
      [email]
    );
    if (!result.rows.length) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = result.rows[0];

    if (!user.approved) {
      return res.status(403).json({ error: "Tu cuenta está pendiente de aprobación" });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signJwt({ userId: user.id, email });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: SAME_SITE,
      maxAge: MAX_AGE,
      path: "/",
    });
    return res.json({ ok: true, user: { id: user.id, name: user.name, email } });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = (req as any).user; // { userId, email }
    // Opcional: traer nombre/approved fresco
    const dbu = await query<{ id:number; name:string; email:string; approved:boolean }>(
      "SELECT id,name,email,approved FROM users WHERE id=$1",
      [user.userId]
    );
    return res.json({ ok: true, user: dbu.rows[0] ?? user });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function logout(_req: Request, res: Response) {
  try {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
