import { Router } from "express";
import { login, register, me, logout, updateAvatar } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { query } from "../db.js";

const router = Router();

// Rutas de autenticación
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.patch("/avatar", requireAuth, updateAvatar);
router.post("/logout", logout);

// ✅ Nuevo endpoint de productos
router.get("/products", requireAuth, async (_req, res) => {
  try {
    const result = await query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno al obtener productos" });
  }
});

router.get("/products/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const result = await query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error interno al obtener producto" });
  }
});

export default router;
