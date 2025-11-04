import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/isAdmin.js";
import { query } from "../db.js";
import fs from "fs";
import path from "path";

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

// Crear producto (POST)
router.post("/products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, imageDataUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Crear carpeta public/images si no existe
    const imagesDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Generar nombre único
    const filename = `${Date.now()}_${name.replace(/\s+/g, "")}.jpg`;
    const filePath = path.join(imagesDir, filename);

    // Limpiar base64
    const base64Data = imageDataUrl?.replace(/^data:image\/\w+;base64,/, "");
    if (base64Data) {
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filePath, buffer);
    }

    // Guardar en BD
    const relativePath = `/images/${filename}`;
    const result = await query(
      `INSERT INTO products (name, description, price, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, description ?? null, price, relativePath]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error interno al crear producto" });
  }
});

// Obtener todos los productos (GET)
router.get("/products", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, price, image_url, created_at, updated_at
       FROM products
       ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ error: "Error interno al listar productos" });
  }
});

// Actualizar producto (PATCH)
router.patch("/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, imageDataUrl } = req.body;

    if (!id || !name || !price) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    // Verificar si el producto existe
    const existing = await query("SELECT * FROM products WHERE id=$1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    let imagePath = existing.rows[0].image_url;

    // Si llega una nueva imagen, reemplazarla
    if (imageDataUrl) {
      const imagesDir = path.join(process.cwd(), "public", "images");
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const filename = `${Date.now()}_${name.replace(/\s+/g, "")}.jpg`;
      const filePath = path.join(imagesDir, filename);
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

      // Eliminar imagen anterior si existe
      const oldPath = path.join(process.cwd(), "public", imagePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      imagePath = `/images/${filename}`;
    }

    // Actualizar datos en BD
    const result = await query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, image_url=$4, updated_at=NOW()
       WHERE id=$5
       RETURNING *`,
      [name, description ?? null, price, imagePath, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error interno al actualizar producto" });
  }
});

// Eliminar producto (DELETE)
router.delete("/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await query("SELECT image_url FROM products WHERE id=$1", [id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar imagen del servidor si existe
    const imgPath = path.join(process.cwd(), "public", product.rows[0].image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ ok: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error interno al eliminar producto" });
  }
});


export default router;