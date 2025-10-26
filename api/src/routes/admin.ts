// api/src/routes/admin.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/isAdmin.js";
import { query } from "../db.js";

const router = Router();

// Listar pendientes
router.get("/pending", requireAuth, requireAdmin, async (_req, res) => {
  const r = await query("SELECT id, name, email, created_at FROM users WHERE approved=false ORDER BY created_at ASC");
  res.json({ ok: true, users: r.rows });
});

// Aprobar usuario
router.post("/users/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await query("UPDATE users SET approved=true, updated_at=NOW() WHERE id=$1", [id]);
  res.json({ ok: true });
});

// Rechazar usuario (eliminar)
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await query("DELETE FROM users WHERE id=$1", [id]);
  res.json({ ok: true });
});

export default router;