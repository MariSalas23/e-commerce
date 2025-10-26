-- ============================================================
-- Users table (creación si no existe)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 🔧 MIGRACIÓN idempotente por si la tabla existe sin 'approved'
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);

-- ============================================================
-- Seed del administrador (solo si no existe)
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