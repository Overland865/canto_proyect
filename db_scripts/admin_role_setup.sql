-- =====================================================
-- SCRIPT: Configuración de Rol de Administrador General
-- Fecha: 2026-01-30
-- Descripción: Agrega el rol 'admin' a la tabla profiles
-- =====================================================

-- 1. Modificar la tabla profiles para soportar el rol 'admin'
-- Si ya existe una restricción de CHECK en la columna role, la eliminamos primero
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Agregar la restricción actualizada que incluye 'admin'
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('consumer', 'provider', 'admin'));

-- 2. Crear una función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear política RLS para que los admins puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- 4. Crear política RLS para que los admins puedan ver todos los provider_profiles
CREATE POLICY "Admins can view all provider profiles"
  ON provider_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- 5. Crear política RLS para que los admins puedan ver todos los servicios
CREATE POLICY "Admins can view all services"
  ON services
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- 6. Crear política RLS para que los admins puedan ver todas las reservas
CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- =====================================================
-- INSTRUCCIONES PARA CREAR UN USUARIO ADMINISTRADOR:
-- =====================================================
-- 
-- Opción 1: Convertir un usuario existente en admin
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'tu-email-admin@ejemplo.com';
--
-- Opción 2: Crear un nuevo usuario admin manualmente
-- 1. Registra el usuario normalmente desde la aplicación
-- 2. Ejecuta el UPDATE de arriba con su email
--
-- =====================================================

-- Comentarios útiles:
COMMENT ON FUNCTION is_admin IS 'Verifica si un usuario tiene rol de administrador';
COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 'Roles permitidos: consumer, provider, admin';

-- Verificación: Mostrar todos los usuarios con rol admin
-- SELECT id, email, full_name, role, created_at 
-- FROM profiles 
-- WHERE role = 'admin';
