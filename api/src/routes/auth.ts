import { Router } from "express";
import { login, register, me, logout, updateAvatar } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { query } from "../db.js";

const router = Router();

// ==========================
// Autenticación
// ==========================
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.patch("/avatar", requireAuth, updateAvatar);
router.post("/logout", logout);

// ==========================
// Productos
// ==========================
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

// ==========================
// Carrito de compras (/api/auth/carrito)
// ==========================

// GET /api/auth/carrito → obtiene carrito del usuario autenticado
router.get("/carrito", requireAuth, async (req, res) => {
  try {
    // El middleware asigna: (req as any).user = { userId, email }
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const itemsQuery = await query(
      `
      SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.image_url,
        (ci.quantity * p.price)::DECIMAL(10,2) AS subtotal
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      ORDER BY ci.id ASC
      `,
      [userId]
    );

    const totalQuery = await query(
      `
      SELECT COALESCE(SUM(ci.quantity * p.price), 0)::DECIMAL(10,2) AS total
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      `,
      [userId]
    );

    res.json({
      items: itemsQuery.rows,
      total: totalQuery.rows[0]?.total ?? "0.00",
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ error: "Error interno al obtener el carrito" });
  }
});

// POST /api/auth/carrito → agrega o actualiza producto en el carrito
// Body: { "productId": number, "quantity": number, "mode": "set" | "inc" }
// POST /api/auth/carrito → agrega o actualiza producto en el carrito
// Body: { "productId": number, "quantity": number, "mode": "set" | "inc" }
router.post("/carrito", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const { productId, quantity, mode } = req.body ?? {};
    const q = Number(quantity);
    const pid = Number(productId);
    const op: "set" | "inc" = mode === "inc" ? "inc" : "set";

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: "productId inválido" });
    }
    if (!Number.isInteger(q) || q <= 0) {
      return res.status(400).json({ error: "quantity debe ser un entero > 0" });
    }

    // Verificar que el producto exista
    const prod = await query(`SELECT id FROM products WHERE id = $1`, [pid]);
    if (prod.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // UPSERT atómico sin transacciones manuales
    await query(
      `
      INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        quantity  = CASE WHEN $4 = 'inc'
                         THEN cart_items.quantity + EXCLUDED.quantity
                         ELSE EXCLUDED.quantity
                    END,
        updated_at = NOW()
      `,
      [userId, pid, q, op]
    );

    // Devolver carrito actualizado
    const items = await query(
      `
      SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.image_url,
        (ci.quantity * p.price)::DECIMAL(10,2) AS subtotal
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      ORDER BY ci.id ASC
      `,
      [userId]
    );

    const total = await query(
      `
      SELECT COALESCE(SUM(ci.quantity * p.price), 0)::DECIMAL(10,2) AS total
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      `,
      [userId]
    );

    res.status(200).json({
      ok: true,
      mode: op,
      items: items.rows,
      total: total.rows[0]?.total ?? "0.00",
    });
  } catch (error) {
    console.error("Error al actualizar carrito:", error);
    res.status(500).json({ error: "Error interno al actualizar el carrito" });
  }
});


// ==========================
// DELETE /api/auth/carrito/:productId → elimina un producto del carrito
// ==========================
router.delete("/carrito/:productId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const productId = Number(req.params.productId);

    if (!userId) return res.status(401).json({ error: "No autenticado" });
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const result = await query(
      `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *`,
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado en carrito" });
    }

    res.json({ ok: true, message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(500).json({ error: "Error interno al eliminar producto del carrito" });
  }
});

// ==========================
// PATCH /api/auth/carrito/:productId → actualiza la cantidad de un producto
// ==========================
router.patch("/carrito/:productId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const productId = Number(req.params.productId);
    const { quantity } = req.body ?? {};
    const q = Number(quantity);

    if (!userId) return res.status(401).json({ error: "No autenticado" });
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }
    if (!Number.isInteger(q) || q <= 0) {
      return res.status(400).json({ error: "quantity debe ser un entero > 0" });
    }

    const result = await query(
      `
      UPDATE cart_items
      SET quantity = $1, updated_at = NOW()
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
      `,
      [q, userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado en carrito" });
    }

    res.json({ ok: true, message: "Cantidad actualizada", updated: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar cantidad del carrito:", error);
    res.status(500).json({ error: "Error interno al actualizar cantidad" });
  }
});

export default router;
