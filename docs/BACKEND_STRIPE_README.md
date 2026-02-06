# 💳 Integración de Stripe: Notas para el Backend

**Fecha**: 2026-02-06
**Estado**: Informativo / Actualización de Esquema

Este documento detalla los cambios realizados en el ecosistema del proyecto para soportar pagos con Stripe. Actualmente, la lógica transaccional (creación de sesiones y webhooks) está alojada en **Next.js (Frontend)**, pero estos cambios afectan la base de datos compartida y podrían requerir actualizaciones en los modelos del backend.

---

## 🔄 Estado de la Arquitectura

- **Logica de Pagos**: Manejada por Next.js API Routes (`/api/create-checkout-session`, `/api/webhooks/stripe`).
- **Base de Datos**: Supabase (PostgreSQL).
- **Backend Node/Express**: Debe reconocer las nuevas columnas para lecturas y reportes.

---

## 🗄️ Cambios en la Base de Datos

Se han agregado columnas a la tabla `bookings` para rastrear el estado de los pagos.

### Tabla: `bookings`

| Nueva Columna | Tipo de Dato | Propósito |
|---|---|---|
| `payment_status` | `text` | Estado: `'pending'`, `'paid'`, `'failed'`, `'refunded'`. Por defecto: `'pending'`. |
| `stripe_session_id` | `text` | ID de sesión de Stripe para rastreo (`cs_test_...`). |
| `stripe_payment_intent` | `text` | ID de la transacción (`pi_...`). |
| `amount_paid` | `numeric(10,2)` | Monto final cobrado. |
| `paid_at` | `timestamp` | Fecha y hora de confirmación del pago. |

### Script de Actualización
Si necesitas replicar esto en otro entorno, el script SQL es:

```sql
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent text,
ADD COLUMN IF NOT EXISTS amount_paid numeric(10,2),
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

ALTER TABLE bookings
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
```

---

## ⚠️ Acciones Requeridas en el Backend (Node/Express)

Si este backend realiza consultas a la tabla `bookings`, considera lo siguiente:

1. **Lectura de Reservas (`GET /bookings`)**:
   - Asegúrate de incluir `payment_status` en las respuestas para que el admin/proveedor sepa si ya pagaron.
   - *Ejemplo SQL/Query*: `SELECT *, payment_status FROM bookings WHERE ...`

2. **Creación de Reservas Manuales**:
   - Si creas reservas desde el backend (ej. panel admin), define el `payment_status` explícitamente (probablemente `'pending'` o `'paid'` si es efectivo).

3. **Validación de Tipos (Si usas TypeScript/Interfaces)**:
   - Actualiza la interfaz de `Booking` para incluir los nuevos campos opcionales.

---

## 🚀 Migración Futura (Opcional)

Si en el futuro deciden mover la lógica de pagos de Next.js a este Backend Express, necesitarán:

1. Instalar Stripe: `npm install stripe`
2. Mover la lógica de `frontend/src/app/api/create-checkout-session` a un controlador Express (ej. `controllers/payment.controller.js`).
3. Crear un endpoint para el Webhook y configurar el raw body parser (Stripe requiere el body crudo para validar la firma).

---

## 📞 Soporte

Cualquier duda sobre la implementación actual en el frontend, revisar `frontend/src/lib/stripe.ts` y las rutas de API en Next.js.
