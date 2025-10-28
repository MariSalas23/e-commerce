-- ============================================================
-- 🧍‍♂️ Tabla de usuarios (creación si no existe)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  avatar TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 🔧 MIGRACIONES idempotentes (solo agregan si faltan columnas)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);

-- ============================================================
-- 👑 Semilla del administrador (solo si no existe)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE LOWER(email) IN ('administrador@adminarepabuela.com','administrador@adminarepabuela.co')
  ) THEN
    INSERT INTO users (name, email, password_hash, approved, created_at, updated_at)
    VALUES (
      'Administrador',
      'administrador@adminarepabuela.com',
      '$argon2id$v=19$m=65536,t=3,p=1$FDlbNsY5ZXAcqp+Y3qKOmA$Rm3Z6ZQy5Ipwk0H4NihIpwZTj6RiPG9yLgPzvKWdSxs',
      true,
      NOW(),
      NOW()
    );
  END IF;
END
$$ LANGUAGE plpgsql;

-- ============================================================
-- 🧱 Tabla de productos
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,                      -- ID autoincremental
  name VARCHAR(150) NOT NULL,                 -- Nombre del producto
  description TEXT,                           -- Descripción opcional
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0), -- Precio con 2 decimales
  image_url TEXT,                             -- URL o ruta de la imagen
  created_at TIMESTAMP DEFAULT NOW(),         -- Fecha de creación
  updated_at TIMESTAMP DEFAULT NOW()          -- Fecha de última actualización
);

-- Índices para mejorar búsquedas por nombre o precio
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============================================================
-- 🧾 Semilla de productos de ejemplo (solo si no existen)
-- ============================================================
INSERT INTO products (name, description, price, image_url)
SELECT name, description, price, image_url
FROM (VALUES
  ('Arepa de maíz blanco', 'Arepa tradicional boyacense elaborada con maíz blanco.', 1500, '/images/arepaMaizBlanco.png'),
  ('Arepa de choclo', 'Arepa dulce de maíz tierno con queso fundido.', 2500, '/images/arepaChoclo.jpg'),
  ('Arepa rellena de queso', 'Arepa gruesa rellena con queso campesino.', 3000, '/images/arepaQueso.jpg'),
  ('Arepa de maíz amarillo', 'Arepa artesanal de maíz amarillo molido.', 1800, '/images/arepaMaizAmarillo.jpg'),
  ('Combo desayuno', 'Arepa + bebida + acompañamiento.', 7000, '/images/arepaCombo.jpg')
) AS data(name, description, price, image_url)
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = data.name
);
