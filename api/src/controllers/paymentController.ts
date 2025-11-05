import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db.js";
import crypto from "crypto";

// ============================================================
// Encryption Configuration
// ============================================================
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default_dev_key_32_chars_minimum!!";
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || "default_dev_iv_16!";

// Ensure keys are correct length
const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
const iv = ENCRYPTION_IV.slice(0, 16).padEnd(16, "0");

/**
 * Encrypts sensitive card data
 */
function encryptCardData(data: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * Decrypts sensitive card data
 */
function decryptCardData(encrypted: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Validates and applies coupon discount
 * Returns { valid: boolean, discount: number, message: string }
 */
export async function validateCoupon(
  couponCode: string,
  userId: number
): Promise<{ valid: boolean; discount: number; message: string }> {
  // Only one coupon available for now: ArepabuelaNew (10% for first-time users)
  if (couponCode !== "ArepabuelaNew") {
    return { valid: false, discount: 0, message: "Código de cupón inválido" };
  }

  // Check if user has already made a purchase
  const userOrders = await query(
    "SELECT COUNT(*) as count FROM orders WHERE user_id = $1",
    [userId]
  );

  const orderCount = parseInt(userOrders.rows[0].count, 10);
  if (orderCount > 0) {
    return {
      valid: false,
      discount: 0,
      message: "Este cupón solo es válido para tu primera compra",
    };
  }

  // Apply 10% discount
  return {
    valid: true,
    discount: 0.1, // 10%
    message: "Cupón aplicado correctamente",
  };
}

// ============================================================
// Schemas de validación
// ============================================================

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/, "Número de tarjeta inválido").optional(),
  cardHolder: z.string().min(2, "Nombre del titular inválido").optional(),
  expiration: z.string().regex(/^\d{2}\/\d{2}$/, "Formato MM/YY requerido").optional(),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido").optional(),
  amount: z.number().positive("Monto debe ser positivo"),
  shippingAddress: z.string().min(5, "Dirección inválida"),
  saveCard: z.boolean().optional(),
  savedCardId: z.number().optional(),
  couponCode: z.string().optional(),
}).refine(
  (data) => data.savedCardId || (data.cardNumber && data.cardHolder && data.expiration && data.cvv),
  {
    message: "Debe proporcionar una tarjeta guardada o los datos de una tarjeta nueva",
    path: ["cardNumber"],
  }
);

const savedCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/, "Número de tarjeta inválido"),
  cardHolder: z.string().min(2, "Nombre del titular inválido"),
  expiration: z.string().regex(/^\d{2}\/\d{2}$/, "Formato MM/YY requerido"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
  isDefault: z.boolean().optional(),
});

// ============================================================
// Utilidades
// ============================================================

/**
 * Valida un número de tarjeta usando el algoritmo de Luhn
 */
function validateCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Extrae los últimos 4 dígitos de la tarjeta
 */
function getCardLastFour(cardNumber: string): string {
  return cardNumber.slice(-4);
}

/**
 * Parsea la fecha de expiración (MM/YY)
 */
function parseExpiration(expiration: string): { month: number; year: number } {
  const [month, year] = expiration.split("/");
  return {
    month: parseInt(month, 10),
    year: 2000 + parseInt(year, 10),
  };
}

// ============================================================
// PROCESS PAYMENT
// ============================================================
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
      cvv,
      amount,
      shippingAddress,
      saveCard,
      savedCardId,
      couponCode,
    } = parsed.data;

    let month: number;
    let year: number;
    let cardLastFour: string;
    let finalCardNumber: string;
    let finalCardHolder: string;
    let finalAmount = amount;
    let discountApplied = 0;

    // ============================================================
    // VALIDATION PHASE - All validations happen FIRST
    // ============================================================

    // Validar y aplicar cupón si se proporciona
    if (couponCode && couponCode.trim()) {
      const couponValidation = await validateCoupon(couponCode.trim(), userId);
      if (!couponValidation.valid) {
        return res.status(400).json({ error: couponValidation.message });
      }
      // Aplicar descuento
      discountApplied = amount * couponValidation.discount;
      finalAmount = amount - discountApplied;
      // Si el total es negativo, establecer a 0
      if (finalAmount < 0) {
        finalAmount = 0;
      }
    }

    // Validar carrito
    const cartItems = await query(
      `
      SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        (ci.quantity * p.price)::DECIMAL(10,2) AS subtotal
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      `,
      [userId]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // Si se proporciona savedCardId, usar la tarjeta guardada
    if (savedCardId) {
      const savedCardResult = await query(
        `
        SELECT card_number_encrypted, card_last_four, expiration_month, expiration_year, card_holder
        FROM saved_cards
        WHERE id = $1 AND user_id = $2
        `,
        [savedCardId, userId]
      );

      if (savedCardResult.rows.length === 0) {
        return res.status(404).json({ error: "Tarjeta guardada no encontrada" });
      }

      const savedCard = savedCardResult.rows[0];
      finalCardNumber = decryptCardData(savedCard.card_number_encrypted);
      finalCardHolder = savedCard.card_holder;
      cardLastFour = savedCard.card_last_four;
      month = savedCard.expiration_month;
      year = savedCard.expiration_year;
      // CVV no es necesario para tarjetas guardadas
    } else {
      // Validar que los campos de tarjeta nueva estén presentes
      if (!cardNumber || !cardHolder || !expiration) {
        return res.status(400).json({ error: "Datos de tarjeta incompletos" });
      }

      finalCardNumber = cardNumber;
      finalCardHolder = cardHolder;

      // Validar número de tarjeta con Luhn
      if (!validateCardNumber(finalCardNumber)) {
        return res.status(400).json({ error: "Número de tarjeta inválido" });
      }

      // Validar expiración
      const parsed = parseExpiration(expiration);
      month = parsed.month;
      year = parsed.year;
      cardLastFour = getCardLastFour(finalCardNumber);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return res.status(400).json({ error: "Tarjeta expirada" });
      }
    }

    // ============================================================
    // TRANSACTION PHASE - Only after all validations pass
    // ============================================================

    // Crear orden
    const orderResult = await query(
      `
      INSERT INTO orders (user_id, total_amount, status, shipping_address, created_at, updated_at)
      VALUES ($1, $2, 'completed', $3, NOW(), NOW())
      RETURNING id
      `,
      [userId, finalAmount, shippingAddress]
    );

    const orderId = orderResult.rows[0].id;

    // Crear transacción
    const transactionResult = await query(
      `
      INSERT INTO transactions (user_id, order_id, amount, card_last_four, card_holder, status, order_items, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'completed', $6, NOW(), NOW())
      RETURNING id, created_at
      `,
      [userId, orderId, finalAmount, cardLastFour, finalCardHolder, JSON.stringify(cartItems.rows)]
    );

    const transactionId = transactionResult.rows[0].id;

    // Guardar tarjeta si lo solicita
    if (saveCard) {
      const encryptedCardNumber = encryptCardData(finalCardNumber);
      await query(
        `
        INSERT INTO saved_cards (user_id, card_last_four, card_holder, card_number_encrypted, expiration_month, expiration_year, is_default, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
        `,
        [userId, cardLastFour, finalCardHolder, encryptedCardNumber, month, year]
      );
    }

    // Limpiar carrito
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
        createdAt: transactionResult.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({ error: "Error al procesar el pago" });
  }
}

// ============================================================
// GET TRANSACTIONS
// ============================================================
export async function getTransactions(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const result = await query(
      `
      SELECT
        t.id,
        t.order_id,
        t.amount,
        t.card_last_four,
        t.card_holder,
        t.status,
        t.created_at,
        o.shipping_address
      FROM transactions t
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      `,
      [userId]
    );

    return res.json({
      ok: true,
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ error: "Error al obtener transacciones" });
  }
}

// ============================================================
// GET SAVED CARDS
// ============================================================
export async function getSavedCards(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const result = await query(
      `
      SELECT
        id,
        card_last_four,
        card_holder,
        expiration_month,
        expiration_year,
        is_default,
        created_at
      FROM saved_cards
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
      `,
      [userId]
    );

    return res.json({
      ok: true,
      cards: result.rows,
    });
  } catch (error) {
    console.error("Get saved cards error:", error);
    return res.status(500).json({ error: "Error al obtener tarjetas guardadas" });
  }
}

// ============================================================
// SAVE CARD
// ============================================================
export async function saveCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const parsed = savedCardSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message || "Datos inválidos";
      return res.status(400).json({ error: first });
    }

    const { cardNumber, cardHolder, expiration, cvv, isDefault } = parsed.data;

    // Validar número de tarjeta
    if (!validateCardNumber(cardNumber)) {
      return res.status(400).json({ error: "Número de tarjeta inválido" });
    }

    // Validar expiración
    const { month, year } = parseExpiration(expiration);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return res.status(400).json({ error: "Tarjeta expirada" });
    }

    const cardLastFour = getCardLastFour(cardNumber);
    const encryptedCardNumber = encryptCardData(cardNumber);

    // Si es default, desmarcar otros
    if (isDefault) {
      await query(
        "UPDATE saved_cards SET is_default = false WHERE user_id = $1",
        [userId]
      );
    }

    const result = await query(
      `
      INSERT INTO saved_cards (user_id, card_last_four, card_holder, card_number_encrypted, expiration_month, expiration_year, is_default, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, card_last_four, card_holder, expiration_month, expiration_year, is_default
      `,
      [userId, cardLastFour, cardHolder, encryptedCardNumber, month, year, isDefault || false]
    );

    return res.status(201).json({
      ok: true,
      card: result.rows[0],
    });
  } catch (error) {
    console.error("Save card error:", error);
    return res.status(500).json({ error: "Error al guardar tarjeta" });
  }
}

// ============================================================
// DELETE SAVED CARD
// ============================================================
export async function deleteSavedCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const cardId = Number(req.params.id);

    if (!userId) return res.status(401).json({ error: "No autenticado" });
    if (!Number.isInteger(cardId) || cardId <= 0) {
      return res.status(400).json({ error: "ID de tarjeta inválido" });
    }

    // Verificar que la tarjeta pertenece al usuario
    const card = await query(
      "SELECT id FROM saved_cards WHERE id = $1 AND user_id = $2",
      [cardId, userId]
    );

    if (card.rows.length === 0) {
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    }

    await query("DELETE FROM saved_cards WHERE id = $1", [cardId]);

    return res.json({ ok: true, message: "Tarjeta eliminada" });
  } catch (error) {
    console.error("Delete saved card error:", error);
    return res.status(500).json({ error: "Error al eliminar tarjeta" });
  }
}

// ============================================================
// SET DEFAULT CARD
// ============================================================
export async function setDefaultCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const cardId = Number(req.params.id);

    if (!userId) return res.status(401).json({ error: "No autenticado" });
    if (!Number.isInteger(cardId) || cardId <= 0) {
      return res.status(400).json({ error: "ID de tarjeta inválido" });
    }

    // Verificar que la tarjeta pertenece al usuario
    const card = await query(
      "SELECT id FROM saved_cards WHERE id = $1 AND user_id = $2",
      [cardId, userId]
    );

    if (card.rows.length === 0) {
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    }

    // Desmarcar todas las tarjetas del usuario
    await query(
      "UPDATE saved_cards SET is_default = false WHERE user_id = $1",
      [userId]
    );

    // Marcar esta como default
    await query(
      "UPDATE saved_cards SET is_default = true WHERE id = $1",
      [cardId]
    );

    return res.json({ ok: true, message: "Tarjeta establecida como predeterminada" });
  } catch (error) {
    console.error("Set default card error:", error);
    return res.status(500).json({ error: "Error al establecer tarjeta predeterminada" });
  }
}
