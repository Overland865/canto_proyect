# 🚀 Plan de Implementación: Stripe + Deployment

**Fecha**: 2026-02-05  
**Objetivo**: Integrar pagos con Stripe y desplegar el proyecto a producción

---

## 📋 FASE 1: Configuración de Stripe

### 1.1 Crear Cuenta y Obtener Credenciales

1. **Crear cuenta en Stripe**:
   - Ir a: https://dashboard.stripe.com/register
   - Completar registro
   - Verificar email

2. **Obtener API Keys**:
   - Dashboard → Developers → API Keys
   - **Publishable Key** (empieza con `pk_test_...`)
   - **Secret Key** (empieza con `sk_test_...`)

3. **Configurar Webhook** (para después):
   - Dashboard → Developers → Webhooks
   - Agregar endpoint cuando tengamos la URL de producción

---

## 📦 FASE 2: Instalación de Dependencias

### 2.1 Instalar Stripe en Frontend

```bash
cd frontend
npm install @stripe/stripe-js stripe
```

### 2.2 Actualizar Variables de Entorno

Agregar a `frontend/.env.local`:
```env
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_key_aqui
STRIPE_SECRET_KEY=sk_test_tu_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
```

---

## 💳 FASE 3: Implementación de Pagos

### 3.1 Flujo de Pago Propuesto

```
Usuario → Selecciona Servicio → Llena Formulario de Reserva
   ↓
Elige Fecha y Detalles
   ↓
Click en "Reservar y Pagar" → Stripe Checkout
   ↓
Pago Exitoso → Webhook → Actualiza DB → Confirmación
```

### 3.2 Archivos a Crear/Modificar

#### A. API Route para Checkout Session
**Archivo**: `frontend/src/app/api/create-checkout-session/route.ts`
- Crea sesión de pago en Stripe
- Recibe: serviceId, providerId, date, price
- Retorna: URL de checkout

#### B. API Route para Webhooks
**Archivo**: `frontend/src/app/api/webhooks/stripe/route.ts`
- Escucha eventos de Stripe
- Actualiza estado de booking en Supabase
- Eventos: `checkout.session.completed`, `payment_intent.succeeded`

#### C. Página de Éxito
**Archivo**: `frontend/src/app/payment/success/page.tsx`
- Muestra confirmación de pago
- Detalles de la reserva

#### D. Página de Cancelación
**Archivo**: `frontend/src/app/payment/cancel/page.tsx`
- Mensaje de pago cancelado
- Opción de reintentar

#### E. Modificar Componente de Booking
**Archivo**: `frontend/src/components/marketplace/service-booking-card.tsx`
- Cambiar "Solicitar Cotización" por "Reservar y Pagar"
- Integrar con Stripe Checkout

---

## 🗄️ FASE 4: Actualización de Base de Datos

### 4.1 Script SQL para Supabase

**Archivo**: `db_scripts/stripe_integration.sql`

```sql
-- Agregar columnas relacionadas con pagos
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent text,
ADD COLUMN IF NOT EXISTS amount_paid numeric(10,2),
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- Constraint para payment_status
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session 
ON bookings(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status 
ON bookings(payment_status);
```

---

## 🌐 FASE 5: Deployment a Producción

### 5.1 Opciones de Hosting

#### Opción A: **Vercel** (Recomendado para Next.js)
✅ **Ventajas**:
- Optimizado para Next.js
- Deploy automático desde GitHub
- SSL gratis
- CDN global
- Fácil configuración

📝 **Pasos**:
1. Ir a: https://vercel.com
2. Conectar con GitHub
3. Importar repositorio `canto_proyect`
4. Configurar:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Agregar variables de entorno
6. Deploy

#### Opción B: **Netlify**
✅ **Ventajas**:
- Fácil de usar
- Deploy automático
- SSL gratis

#### Opción C: **Railway / Render**
✅ **Ventajas**:
- Soporte para backend también
- Base de datos incluida

### 5.2 Configuración de Variables de Entorno en Producción

En Vercel/Netlify, agregar:
```
NEXT_PUBLIC_SUPABASE_URL=https://ouyshfzqmkdykgnkltbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_key_produccion
STRIPE_SECRET_KEY=sk_live_tu_key_produccion
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_produccion
```

⚠️ **IMPORTANTE**: Usar keys de **LIVE MODE** en producción

### 5.3 Configurar Dominio Personalizado (Opcional)

1. Comprar dominio (GoDaddy, Namecheap, etc.)
2. En Vercel: Settings → Domains → Add Domain
3. Configurar DNS según instrucciones

---

## 🔐 FASE 6: Seguridad y Testing

### 6.1 Checklist de Seguridad

- [ ] Variables de entorno NO están en el código
- [ ] Webhook signature verification implementada
- [ ] RLS policies en Supabase actualizadas
- [ ] HTTPS habilitado (automático en Vercel)
- [ ] CORS configurado correctamente

### 6.2 Testing de Pagos

**Tarjetas de Prueba de Stripe**:
```
Éxito: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

Fecha: Cualquier fecha futura  
CVC: Cualquier 3 dígitos  
ZIP: Cualquier 5 dígitos

---

## 📊 FASE 7: Monitoreo Post-Deploy

### 7.1 Configurar Stripe Dashboard

- Activar notificaciones de email
- Revisar logs de webhooks
- Configurar alertas de fraude

### 7.2 Analytics

- Vercel Analytics (gratis)
- Google Analytics (opcional)
- Supabase Dashboard para DB monitoring

---

## 🎯 Orden de Implementación Recomendado

### Semana 1: Stripe Integration
1. ✅ Crear cuenta Stripe
2. ✅ Instalar dependencias
3. ✅ Crear API routes
4. ✅ Actualizar DB schema
5. ✅ Modificar componente de booking
6. ✅ Testing local con tarjetas de prueba

### Semana 2: Deployment
1. ✅ Preparar proyecto para producción
2. ✅ Configurar Vercel
3. ✅ Deploy inicial
4. ✅ Configurar webhooks en producción
5. ✅ Testing en producción (modo test)
6. ✅ Activar modo LIVE

---

## 📝 Notas Importantes

### Costos de Stripe
- **Sin cuota mensual**
- **2.9% + $0.30 USD** por transacción exitosa
- Pagos internacionales: +1.5%

### Consideraciones Legales
- [ ] Términos y condiciones de servicio
- [ ] Política de privacidad
- [ ] Política de reembolsos
- [ ] Cumplimiento con leyes locales

### Suporte
- Documentación Stripe: https://stripe.com/docs
- Documentación Vercel: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

---

## 🚀 Próximos Pasos Inmediatos

1. **Crear cuenta en Stripe** (5 min)
2. **Instalar dependencias** (2 min)
3. **Crear archivos de API** (30 min)
4. **Actualizar DB** (5 min)
5. **Testing local** (15 min)

**Total estimado para MVP de pagos**: ~2-3 horas

---

**¿Listo para empezar?** 🎉
