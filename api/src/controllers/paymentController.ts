import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db.js";
import crypto from "crypto";

/* ============================================================
   Cifrado para tarjetas guardadas (sin CVV)
============================================================ */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default_dev_key_32_chars_minimum!!";
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || "default_dev_iv_16!";
const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
const iv = ENCRYPTION_IV.slice(0, 16).padEnd(16, "0");

function encryptCardData(data: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}
function decryptCardData(enc: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let dec = decipher.update(enc, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

/* ============================================================
   Utilidades (sin validar Luhn / fecha)
============================================================ */
function getCardLastFour(cardNumber: string): string {
  const digits = String(cardNumber || "").replace(/\D/g, "");
  return digits.slice(-4) || "0000";
}
function parseExpiration(expiration?: string): { month: number; year: number } {
  // Si no llega, usa un fallback "12/99"
  const src = (expiration || "12/99").trim();
  const [mm, yy] = src.split("/");
  const month = Math.max(1, Math.min(12, parseInt(mm || "12", 10) || 12));
  const year = 2000 + (parseInt(yy || "99", 10) || 99);
  return { month, year };
}

/* ============================================================
   🔒 AGREGADO: Helpers de validación estricta (16 dígitos y fecha)
============================================================ */
// Normaliza a solo dígitos
function onlyDigits(s: string) {
  return String(s || "").replace(/\D/g, "");
}

// Verifica exactamente 16 dígitos
function isCardNumber16(num?: string) {
  const digits = onlyDigits(num || "");
  return /^\d{16}$/.test(digits);
}

// Parse estricto MM/YY (dos dígitos de año → 2000..2099)
function parseMMYYStrict(exp?: string): { ok: boolean; month: number; year: number } {
  const raw = String(exp || "").trim();
  if (!/^\d{2}\/\d{2}$/.test(raw)) return { ok: false, month: 12, year: 2099 };
  const [mmStr, yyStr] = raw.split("/");
  const mm = parseInt(mmStr, 10);
  const yy = parseInt(yyStr, 10);
  if (!Number.isFinite(mm) || mm < 1 || mm > 12) return { ok: false, month: 12, year: 2099 };
  const fullYear = 2000 + yy;
  return { ok: true, month: mm, year: fullYear };
}

// Regla: vencida o que venza este mes ⇒ inválida
function isExpiredOrThisMonthByYM(month: number, year: number): boolean {
  const now = new Date();
  const curMonth = now.getMonth() + 1; // 1..12
  const curYear = now.getFullYear();
  if (year < curYear) return true;
  if (year === curYear && month <= curMonth) return true; // incluye este mes
  return false;
}

/* ============================================================
   Cupón (igual que antes)
============================================================ */
export async function validateCoupon(
  couponCode: string,
  userId: number
): Promise<{ valid: boolean; discount: number; message: string }> {
  if (couponCode !== "ArepabuelaNew") {
    return { valid: false, discount: 0, message: "Código de cupón inválido" };
  }
  const userOrders = await query("SELECT COUNT(*) AS count FROM orders WHERE user_id = $1", [userId]);
  const orderCount = parseInt(userOrders.rows[0].count, 10);
  if (orderCount > 0) {
    return { valid: false, discount: 0, message: "Este cupón solo es válido para tu primera compra" };
  }
  return { valid: true, discount: 0.1, message: "Cupón aplicado correctamente" };
}

/* ============================================================
   Schemas (sin CVV y sin validaciones estrictas)
============================================================ */
const paymentSchema = z.object({
  // Para “aceptar todo”, todos los campos de tarjeta son opcionales;
  // sólo exigimos amount y dirección.
  cardNumber: z.string().optional(),
  cardHolder: z.string().optional(),
  expiration: z.string().optional(), // "MM/YY"
  amount: z.number().positive("Monto debe ser positivo"),
  shippingAddress: z.string().min(5, "Dirección inválida"),
  saveCard: z.boolean().optional(),
  savedCardId: z.number().optional(),
  couponCode: z.string().optional(),
});

const savedCardSchema = z.object({
  cardNumber: z.string(),     // sin regex para aceptar cualquiera
  cardHolder: z.string().min(2, "Nombre del titular inválido"),
  expiration: z.string().optional(), // permitimos vacío → fallback "12/99"
  isDefault: z.boolean().optional(),
});

/* ============================================================
   PROCESS PAYMENT (acepta cualquier tarjeta)
============================================================ */
export async function processPayment(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message || "Datos inválidos";
      return res.status(400).json({ error: first });
    }

    let {
      cardNumber,
      cardHolder,
      expiration,
      amount,
      shippingAddress,
      saveCard,
      savedCardId,
      couponCode,
    } = parsed.data;

    // Descuento (igual que antes)
    let finalAmount = amount;
    let discountApplied = 0;
    if (couponCode && couponCode.trim()) {
      const c = await validateCoupon(couponCode.trim(), userId);
      if (!c.valid) return res.status(400).json({ error: c.message });
      discountApplied = amount * c.discount;
      finalAmount = Math.max(0, amount - discountApplied);
    }

    // Carrito debe existir
    const cartItems = await query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price,
              (ci.quantity * p.price)::DECIMAL(10,2) AS subtotal
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [userId]
    );
    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // Si usa tarjeta guardada
    let month: number, year: number, cardLastFour: string, finalCardNumber: string, finalCardHolder: string;

    if (savedCardId) {
      const r = await query(
        `SELECT card_number_encrypted, card_last_four, expiration_month, expiration_year, card_holder
         FROM saved_cards WHERE id=$1 AND user_id=$2`,
        [savedCardId, userId]
      );
      if (r.rows.length === 0) return res.status(404).json({ error: "Tarjeta guardada no encontrada" });

      const sc = r.rows[0];

      /* 🔒 AGREGADO: validar que NO esté vencida ni venza este mes */
      if (isExpiredOrThisMonthByYM(Number(sc.expiration_month), Number(sc.expiration_year))) {
        return res.status(400).json({ error: "La tarjeta guardada está vencida o vence este mes" });
      }

      finalCardNumber = decryptCardData(sc.card_number_encrypted);
      finalCardHolder = sc.card_holder;
      cardLastFour = sc.card_last_four;
      month = sc.expiration_month;
      year = sc.expiration_year;
    } else {
      /* 🔒 AGREGADO: número 16 dígitos y expiración futura (no este mes) */
      if (!isCardNumber16(cardNumber)) {
        return res.status(400).json({ error: "El número de tarjeta debe tener exactamente 16 dígitos" });
      }
      if (!cardHolder || cardHolder.trim().length < 2) {
        return res.status(400).json({ error: "Nombre del titular inválido" });
      }
      const strictExp = parseMMYYStrict(expiration);
      if (!strictExp.ok) {
        return res.status(400).json({ error: "Fecha de expiración inválida (usa MM/YY)" });
      }
      if (isExpiredOrThisMonthByYM(strictExp.month, strictExp.year)) {
        return res.status(400).json({ error: "La tarjeta está vencida o vence este mes" });
      }

      // Tarjeta nueva: aceptamos cualquier número y expiración
      finalCardNumber = String(cardNumber || "");
      finalCardHolder = String(cardHolder || "Titular");
      const exp = parseExpiration(expiration);
      month = exp.month;
      year = exp.year;
      cardLastFour = getCardLastFour(finalCardNumber);
    }

    // Crear orden
    const order = await query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, created_at, updated_at)
       VALUES ($1, $2, 'completed', $3, NOW(), NOW()) RETURNING id`,
      [userId, finalAmount, shippingAddress]
    );
    const orderId = order.rows[0].id;

    // Crear transacción
    const tx = await query(
      `INSERT INTO transactions (user_id, order_id, amount, card_last_four, card_holder, status, order_items, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'completed', $6, NOW(), NOW())
       RETURNING id, created_at`,
      [userId, orderId, finalAmount, cardLastFour, finalCardHolder, JSON.stringify(cartItems.rows)]
    );
    const transactionId = tx.rows[0].id;

    // Guardar tarjeta si se pidió (sin CVV)
    if (saveCard && !savedCardId) {
      const encrypted = encryptCardData(finalCardNumber);
      await query(
        `INSERT INTO saved_cards
           (user_id, card_last_four, card_holder, card_number_encrypted, expiration_month, expiration_year, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())`,
        [userId, cardLastFour, finalCardHolder, encrypted, month, year]
      );
    }

    // Vaciar carrito
    await query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    return res.status(201).json({
      ok: true,
      transaction: {
        id: transactionId,
        orderId,
        originalAmount: amount,
        discountApplied,
        finalAmount,
        cardLastFour,
        status: "completed",
        createdAt: tx.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({ error: "Error al procesar el pago" });
  }
}

/* ============================================================
   GET TRANSACTIONS (sin cambios)
============================================================ */
export async function getTransactions(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const result = await query(
      `SELECT t.id, t.order_id, t.amount, t.card_last_four, t.card_holder, t.status, t.created_at,
              o.shipping_address
       FROM transactions t
       LEFT JOIN orders o ON t.order_id = o.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return res.json({ ok: true, transactions: result.rows });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ error: "Error al obtener transacciones" });
  }
}

/* ============================================================
   GET SAVED CARDS (sin cambios)
============================================================ */
export async function getSavedCards(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const result = await query(
      `SELECT id, card_last_four, card_holder, expiration_month, expiration_year, is_default, created_at
       FROM saved_cards
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    return res.json({ ok: true, cards: result.rows });
  } catch (error) {
    console.error("Get saved cards error:", error);
    return res.status(500).json({ error: "Error al obtener tarjetas guardadas" });
  }
}

/* ============================================================
   SAVE CARD (sin CVV, acepta todo)
============================================================ */
export async function saveCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const parsed = savedCardSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message || "Datos inválidos";
      return res.status(400).json({ error: first });
    }

    const { cardNumber, cardHolder, expiration, isDefault } = parsed.data;

    /* 🔒 AGREGADO: Validar 16 dígitos y expiración futura (no este mes) */
    if (!isCardNumber16(cardNumber)) {
      return res.status(400).json({ error: "El número de tarjeta debe tener exactamente 16 dígitos" });
    }
    const strictExp = parseMMYYStrict(expiration);
    if (!strictExp.ok) {
      return res.status(400).json({ error: "Fecha de expiración inválida (usa MM/YY)" });
    }
    if (isExpiredOrThisMonthByYM(strictExp.month, strictExp.year)) {
      return res.status(400).json({ error: "La tarjeta está vencida o vence este mes" });
    }

    const { month, year } = parseExpiration(expiration);
    const cardLastFour = getCardLastFour(cardNumber);
    const encrypted = encryptCardData(cardNumber);

    if (isDefault) {
      await query("UPDATE saved_cards SET is_default=false WHERE user_id=$1", [userId]);
    }

    const r = await query(
      `INSERT INTO saved_cards
         (user_id, card_last_four, card_holder, card_number_encrypted, expiration_month, expiration_year, is_default, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, NOW(), NOW())
       RETURNING id, card_last_four, card_holder, expiration_month, expiration_year, is_default`,
      [userId, cardLastFour, cardHolder, encrypted, month, year, isDefault || false]
    );

    return res.status(201).json({ ok: true, card: r.rows[0] });
  } catch (error) {
    console.error("Save card error:", error);
    return res.status(500).json({ error: "Error al guardar tarjeta" });
  }
}

/* ============================================================
   DELETE / SET DEFAULT (sin cambios)
============================================================ */
export async function deleteSavedCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const cardId = Number(req.params.id);
    if (!userId) return res.status(401).json({ error: "No autenticado" });
    if (!Number.isInteger(cardId) || cardId <= 0) {
      return res.status(400).json({ error: "ID de tarjeta inválido" });
    }

    const card = await query("SELECT id FROM saved_cards WHERE id=$1 AND user_id=$2", [cardId, userId]);
    if (card.rows.length === 0) return res.status(404).json({ error: "Tarjeta no encontrada" });

    await query("DELETE FROM saved_cards WHERE id=$1", [cardId]);
    return res.json({ ok: true, message: "Tarjeta eliminada" });
  } catch (error) {
    console.error("Delete saved card error:", error);
    return res.status(500).json({ error: "Error al eliminar tarjeta" });
  }
}

export async function setDefaultCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const cardId = Number(req.params.id);
    if (!userId) return res.status(401).json({ error: "No autenticado" });
    if (!Number.isInteger(cardId) || cardId <= 0) {
      return res.status(400).json({ error: "ID de tarjeta inválido" });
    }

    const card = await query("SELECT id FROM saved_cards WHERE id=$1 AND user_id=$2", [cardId, userId]);
    if (card.rows.length === 0) return res.status(404).json({ error: "Tarjeta no encontrada" });

    await query("UPDATE saved_cards SET is_default=false WHERE user_id=$1", [userId]);
    await query("UPDATE saved_cards SET is_default=true WHERE id=$1", [cardId]);

    return res.json({ ok: true, message: "Tarjeta establecida como predeterminada" });
  } catch (error) {
    console.error("Set default card error:", error);
    return res.status(500).json({ error: "Error al establecer tarjeta predeterminada" });
  }
}