-- Migración: Crear tabla de servicios de proveedores
-- Fecha: 2026-02-27

-- Crear tabla provider_services para almacenar detalles específicos por categoría
CREATE TABLE IF NOT EXISTS provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL, -- banquetero, rentador-local, etc
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Campos para Banquetero
    capacity INT,
    min_guests INT,
    price_per_person DECIMAL(10, 2),
    cuisine_types TEXT,
    dietary_options TEXT,
    services_included TEXT,
    
    -- Campos para Rentador de Local
    square_meters INT,
    price_per_hour DECIMAL(10, 2),
    price_per_day DECIMAL(10, 2),
    location TEXT,
    amenities TEXT,
    parking_available BOOLEAN DEFAULT false,
    catering_allowed BOOLEAN DEFAULT false,
    
    -- Campos generales
    photos JSON,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    UNIQUE(provider_id)
);

-- Agregar columna profile_completed a tabla providers si no existe
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_category ON provider_services(category);
CREATE INDEX IF NOT EXISTS idx_providers_profile_completed ON providers(profile_completed);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_provider_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_services_timestamp
    BEFORE UPDATE ON provider_services
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_services_timestamp();
