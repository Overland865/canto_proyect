-- Migración: Agregar soporte de categorías para proveedores
-- Fecha: 2026-02-27

-- 1. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla de solicitudes de proveedores
CREATE TABLE IF NOT EXISTS provider_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    category_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 3. Actualizar tabla providers para incluir categoría
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS category_id INT,
ADD COLUMN IF NOT EXISTS provider_request_id UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD FOREIGN KEY (category_id) REFERENCES categories(id),
ADD FOREIGN KEY (provider_request_id) REFERENCES provider_requests(id);

-- 4. Insertar categorías iniciales
INSERT INTO categories (name, slug, description) VALUES
    ('Banquetero', 'banquetero', 'Servicios de catering y eventos gastronómicos'),
    ('Rentador de Local', 'rentador-local', 'Alquiler de espacios para eventos'),
    ('Decoración', 'decoracion', 'Servicios de decoración y ambientación'),
    ('Fotografía', 'fotografia', 'Servicios de fotografía y video'),
    ('DJ y Música', 'dj-musica', 'Servicios de música y entretenimiento'),
    ('Transporte', 'transporte', 'Servicios de transporte para eventos')
ON CONFLICT (name) DO NOTHING;

-- 5. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_provider_requests_status ON provider_requests(status);
CREATE INDEX IF NOT EXISTS idx_provider_requests_category ON provider_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);