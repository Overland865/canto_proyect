# 🚀 Quick Start - Stripe + Deployment

Comandos rápidos para empezar con la implementación.

---

## 📋 Paso 1: Configurar Stripe (5 minutos)

### 1. Crear cuenta
```
Ir a: https://dashboard.stripe.com/register
```

### 2. Obtener API Keys
```
Ir a: https://dashboard.stripe.com/test/apikeys
Copiar: Publishable key (pk_test_...)
Copiar: Secret key (sk_test_...)
```

### 3. Actualizar .env.local
```bash
cd frontend
# Editar .env.local y reemplazar:
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_KEY_AQUI
# STRIPE_SECRET_KEY=sk_test_TU_SECRET_KEY_AQUI
```

---

## 🗄️ Paso 2: Actualizar Base de Datos (2 minutos)

### 1. Abrir Supabase
```
Ir a: https://supabase.com/dashboard
→ Tu proyecto
→ SQL Editor
```

### 2. Ejecutar script
```sql
-- Copiar todo el contenido de: db_scripts/stripe_integration.sql
-- Pegar en SQL Editor
-- Click en "Run"
```

---

## 🧪 Paso 3: Probar Localmente (5 minutos)

### 1. Iniciar servidor
```bash
cd frontend
npm run dev
```

### 2. Probar pago
```
1. Ir a: http://localhost:4200
2. Login o registrarse
3. Ir al marketplace
4. Seleccionar un servicio
5. Click en "Reservar y Pagar"
6. Usar tarjeta de prueba:
   - Número: 4242 4242 4242 4242
   - Fecha: 12/34
   - CVC: 123
   - ZIP: 12345
7. Completar pago
8. Verificar redirección a /payment/success
```

### 3. Verificar en Supabase
```
Ir a: Table Editor → bookings
Verificar que existe el nuevo booking con:
- payment_status = 'paid'
- stripe_session_id = 'cs_test_...'
- amount_paid = [monto]
```

---

## 🌐 Paso 4: Deploy a Vercel (10 minutos)

### 1. Crear cuenta
```
Ir a: https://vercel.com/signup
→ Sign up with GitHub
→ Autorizar Vercel
```

### 2. Importar proyecto
```
Dashboard → Add New... → Project
→ Buscar: canto_proyect
→ Import
```

### 3. Configurar
```
Framework Preset: Next.js
Root Directory: frontend  ⚠️ IMPORTANTE
Build Command: npm run build
Output Directory: .next
```

### 4. Variables de entorno
```
Agregar en Environment Variables:

NEXT_PUBLIC_SUPABASE_URL=https://ouyshfzqmkdykgnkltbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu_anon_key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[pk_test_...]
STRIPE_SECRET_KEY=[sk_test_...]
STRIPE_WEBHOOK_SECRET=[dejar vacío por ahora]
```

### 5. Deploy
```
Click en "Deploy"
Esperar 2-3 minutos
✅ App desplegada en: https://tu-proyecto.vercel.app
```

---

## 🔗 Paso 5: Configurar Webhooks (5 minutos)

### 1. Crear webhook en Stripe
```
Ir a: https://dashboard.stripe.com/test/webhooks
→ Add endpoint
→ Endpoint URL: https://tu-proyecto.vercel.app/api/webhooks/stripe
→ Events to send:
   ✓ checkout.session.completed
   ✓ payment_intent.succeeded
   ✓ payment_intent.payment_failed
→ Add endpoint
```

### 2. Obtener signing secret
```
Click en el webhook creado
→ Signing secret → Reveal
→ Copiar: whsec_...
```

### 3. Actualizar en Vercel
```
Vercel Dashboard → Tu proyecto
→ Settings → Environment Variables
→ Buscar: STRIPE_WEBHOOK_SECRET
→ Edit → Pegar el secret
→ Save
→ Deployments → Latest → Redeploy
```

---

## ✅ Paso 6: Probar en Producción (5 minutos)

### 1. Hacer una reserva de prueba
```
1. Ir a: https://tu-proyecto.vercel.app
2. Login
3. Marketplace → Seleccionar servicio
4. Reservar y Pagar
5. Tarjeta: 4242 4242 4242 4242
6. Completar pago
7. ✅ Verificar página de éxito
```

### 2. Verificar webhook
```
Ir a: https://dashboard.stripe.com/test/webhooks
→ Tu webhook → Events
→ Verificar evento con status "Succeeded"
```

### 3. Verificar booking
```
Supabase → Table Editor → bookings
→ Verificar nuevo booking con payment_status = 'paid'
```

---

## 🎯 Comandos Útiles

### Ver logs en Vercel
```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Ver logs en tiempo real
vercel logs tu-proyecto.vercel.app
```

### Probar webhook localmente
```bash
# Instalar Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:4200/api/webhooks/stripe
```

### Redeploy rápido
```bash
# Desde la raíz del proyecto
git add .
git commit -m "Update"
git push

# Vercel detecta el push y redeploy automáticamente
```

---

## 🆘 Troubleshooting Rápido

### Error: "Stripe is not configured"
```bash
# Verificar que la variable esté configurada
# En Vercel: Settings → Environment Variables
# Debe existir: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Redeploy después de agregar
```

### Error: "Webhook signature verification failed"
```bash
# 1. Verificar STRIPE_WEBHOOK_SECRET en Vercel
# 2. Verificar que el webhook apunte a la URL correcta
# 3. Redeploy
```

### Booking no se crea después del pago
```bash
# 1. Verificar logs del webhook en Stripe Dashboard
# 2. Verificar que el script SQL se ejecutó
# 3. Verificar políticas RLS en Supabase
```

---

## 📚 Documentación Completa

Para más detalles, consultar:

- **Plan completo**: `PLAN_STRIPE_DEPLOYMENT.md`
- **Guía de deployment**: `GUIA_DEPLOYMENT_VERCEL.md`
- **Resumen técnico**: `RESUMEN_IMPLEMENTACION_STRIPE.md`

---

## ⏱️ Tiempo Total Estimado

- Configurar Stripe: **5 min**
- Actualizar DB: **2 min**
- Probar localmente: **5 min**
- Deploy a Vercel: **10 min**
- Configurar webhooks: **5 min**
- Probar en producción: **5 min**

**Total: ~30 minutos** ⚡

---

## 🎉 ¡Listo!

Tu aplicación está ahora en producción con pagos funcionando.

**URL**: https://tu-proyecto.vercel.app

---

**Última actualización**: 2026-02-05
