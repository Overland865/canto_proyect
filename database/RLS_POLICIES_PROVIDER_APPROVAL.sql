-- RLS Policies para Sistema de Aprobación de Proveedores
-- Ejecutar en Supabase SQL Editor

-- ==========================================
-- 1. TABLA: categories
-- ==========================================
-- Todos los usuarios pueden leer las categorías
CREATE POLICY "Allow public read categories" ON categories
  FOR SELECT USING (true);

-- Solo admin puede insertar/actualizar/eliminar categorías
CREATE POLICY "Allow admin manage categories" ON categories
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin')
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin update categories" ON categories
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin delete categories" ON categories
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- ==========================================
-- 2. TABLA: provider_requests
-- ==========================================
-- Cualquiera puede crear solicitud (sin autenticación)
CREATE POLICY "Allow anyone create provider request" ON provider_requests
  FOR INSERT WITH CHECK (true);

-- Admin puede ver todas las solicitudes
CREATE POLICY "Allow admin view all requests" ON provider_requests
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Admin puede actualizar solicitudes
CREATE POLICY "Allow admin update requests" ON provider_requests
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- El proveedor puede ver su propia solicitud si está aprobado
CREATE POLICY "Allow provider view own request" ON provider_requests
  FOR SELECT USING (
    auth.uid()::uuid IN (
      SELECT id FROM providers WHERE provider_request_id = provider_requests.id
    )
  );

-- ==========================================
-- 3. TABLA: providers (actualizada)
-- ==========================================
-- Todos pueden leer proveedores aprobados (perfil público)
CREATE POLICY "Allow public view approved providers" ON providers
  FOR SELECT USING (approved_at IS NOT NULL);

-- Proveedor puede ver su propio perfil
CREATE POLICY "Allow provider view own profile" ON providers
  FOR SELECT USING (auth.uid() = id);

-- Proveedor puede actualizar su propio perfil
CREATE POLICY "Allow provider update own profile" ON providers
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin puede ver todos los proveedores
CREATE POLICY "Allow admin view all providers" ON providers
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Admin puede actualizar proveedores
CREATE POLICY "Allow admin update providers" ON providers
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ==========================================
-- HABILITAR RLS EN TABLAS
-- ==========================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
