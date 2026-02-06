-- ============================================
-- Script de Integración de Stripe
-- Fecha: 2026-02-05
-- Propósito: Agregar soporte para pagos con Stripe
-- ============================================

-- 1. Agregar columnas relacionadas con pagos a la tabla bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent text,
ADD COLUMN IF NOT EXISTS amount_paid numeric(10,2),
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- 2. Agregar constraint para payment_status
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- 3. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session 
ON bookings(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status 
ON bookings(payment_status);

CREATE INDEX IF NOT EXISTS idx_bookings_user_payment 
ON bookings(user_id, payment_status);

-- 4. Comentarios para documentación
COMMENT ON COLUMN bookings.payment_status IS 'Estado del pago: pending, paid, failed, refunded';
COMMENT ON COLUMN bookings.stripe_session_id IS 'ID de la sesión de checkout de Stripe';
COMMENT ON COLUMN bookings.stripe_payment_intent IS 'ID del payment intent de Stripe';
COMMENT ON COLUMN bookings.amount_paid IS 'Monto pagado en la transacción';
COMMENT ON COLUMN bookings.paid_at IS 'Fecha y hora en que se completó el pago';

-- 5. Actualizar bookings existentes (opcional)
-- Si ya tienes bookings con status 'confirmed', puedes marcarlos como pagados
-- UPDATE bookings 
-- SET payment_status = 'paid', 
--     amount_paid = price,
--     paid_at = created_at
-- WHERE status = 'confirmed' AND payment_status = 'pending';

-- ============================================
-- Verificación
-- ============================================

-- Ver estructura actualizada de la tabla bookings
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- ============================================
-- Políticas RLS (Row Level Security)
-- ============================================

-- Permitir que los usuarios vean sus propios pagos
DROP POLICY IF EXISTS "Users can view their own payment details" ON bookings;
CREATE POLICY "Users can view their own payment details"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Permitir que los proveedores vean los pagos de sus servicios
DROP POLICY IF EXISTS "Providers can view payments for their services" ON bookings;
CREATE POLICY "Providers can view payments for their services"
ON bookings FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE id = bookings.provider_id
    )
);

-- ============================================
-- Función auxiliar para obtener estadísticas de pagos
-- ============================================

CREATE OR REPLACE FUNCTION get_payment_stats(provider_user_id uuid)
RETURNS TABLE (
    total_bookings bigint,
    paid_bookings bigint,
    pending_bookings bigint,
    total_revenue numeric,
    pending_revenue numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::bigint as total_bookings,
        COUNT(*) FILTER (WHERE payment_status = 'paid')::bigint as paid_bookings,
        COUNT(*) FILTER (WHERE payment_status = 'pending')::bigint as pending_bookings,
        COALESCE(SUM(amount_paid) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue,
        COALESCE(SUM(price) FILTER (WHERE payment_status = 'pending'), 0) as pending_revenue
    FROM bookings
    WHERE provider_id = provider_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejemplo de uso:
-- SELECT * FROM get_payment_stats('uuid-del-proveedor');

-- ============================================
-- Trigger para actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger si la columna updated_at existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
        CREATE TRIGGER update_bookings_updated_at
            BEFORE UPDATE ON bookings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

COMMIT;
