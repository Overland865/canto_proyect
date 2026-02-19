# 🚀 Guía de Deployment en Vercel

Esta guía te llevará paso a paso para desplegar tu aplicación Local_Space en Vercel.

---

## 📋 Pre-requisitos

- [ ] Cuenta en GitHub (ya tienes el repositorio)
- [ ] Cuenta en Stripe (crear en paso 1)
- [ ] Cuenta en Vercel (crear en paso 2)
- [ ] Base de datos Supabase configurada

---

## 🔧 PASO 1: Configurar Stripe

### 1.1 Crear Cuenta

1. Ve a: https://dashboard.stripe.com/register
2. Completa el registro
3. Verifica tu email

### 1.2 Obtener API Keys (Modo Test)

1. Ve a: https://dashboard.stripe.com/test/apikeys
2. Copia las siguientes keys:

```
Publishable key: pk_test_51...
Secret key: sk_test_51...
```

3. **Actualiza tu `.env.local`** con estas keys:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_key_aqui
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
```

⚠️ **IMPORTANTE**: NO subas estas keys a GitHub. El archivo `.env.local` ya está en `.gitignore`.

---

## 🌐 PASO 2: Configurar Vercel

### 2.1 Crear Cuenta

1. Ve a: https://vercel.com/signup
2. Regístrate con tu cuenta de GitHub
3. Autoriza a Vercel para acceder a tus repositorios

### 2.2 Importar Proyecto

1. En el dashboard de Vercel, click en **"Add New..."** → **"Project"**
2. Busca y selecciona el repositorio: `canto_proyect`
3. Click en **"Import"**

### 2.3 Configurar el Proyecto

En la pantalla de configuración:

**Framework Preset**: Next.js (se detecta automáticamente)

**Root Directory**: 
```
frontend
```
⚠️ **MUY IMPORTANTE**: Debes cambiar el Root Directory a `frontend`

**Build Command**: 
```
npm run build
```

**Output Directory**: 
```
.next
```

**Install Command**: 
```
npm install
```

### 2.4 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ouyshfzqmkdykgnkltbj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_tu_key_de_stripe` |
| `STRIPE_SECRET_KEY` | `sk_test_tu_secret_key_de_stripe` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (configurar después) |

✅ Asegúrate de marcar todas como disponibles para: **Production**, **Preview**, y **Development**

### 2.5 Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel construye tu aplicación
3. ¡Listo! Tu app estará en: `https://tu-proyecto.vercel.app`

---

## 🔗 PASO 3: Configurar Webhooks de Stripe

Una vez que tu app esté desplegada, necesitas configurar los webhooks para que Stripe pueda notificar a tu app sobre pagos exitosos.

### 3.1 Obtener URL de Webhook

Tu URL de webhook será:
```
https://tu-proyecto.vercel.app/api/webhooks/stripe
```

### 3.2 Configurar en Stripe Dashboard

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Click en **"Add endpoint"**
3. En **"Endpoint URL"**, pega: `https://tu-proyecto.vercel.app/api/webhooks/stripe`
4. En **"Events to send"**, selecciona:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click en **"Add endpoint"**

### 3.3 Obtener Signing Secret

1. Click en el webhook que acabas de crear
2. En la sección **"Signing secret"**, click en **"Reveal"**
3. Copia el secret (empieza con `whsec_...`)

### 3.4 Actualizar Variable de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Busca `STRIPE_WEBHOOK_SECRET`
4. Edita y pega el signing secret
5. Click en **"Save"**
6. **Redeploy** tu aplicación para que tome el cambio

---

## 🗄️ PASO 4: Actualizar Base de Datos

### 4.1 Ejecutar Script SQL

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Abre el archivo `db_scripts/stripe_integration.sql`
5. Copia todo el contenido
6. Pégalo en el SQL Editor de Supabase
7. Click en **"Run"**

✅ Esto agregará las columnas necesarias para pagos en la tabla `bookings`

---

## 🧪 PASO 5: Probar el Sistema

### 5.1 Probar en Producción (Modo Test)

1. Ve a tu app: `https://tu-proyecto.vercel.app`
2. Regístrate o inicia sesión
3. Busca un servicio en el marketplace
4. Intenta hacer una reserva
5. En el checkout de Stripe, usa una tarjeta de prueba:

**Tarjetas de Prueba**:
```
Éxito: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

- **Fecha**: Cualquier fecha futura
- **CVC**: Cualquier 3 dígitos
- **ZIP**: Cualquier 5 dígitos

6. Completa el pago
7. Deberías ser redirigido a `/payment/success`
8. Verifica en Supabase que se creó el booking con `payment_status = 'paid'`

### 5.2 Verificar Webhooks

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Click en tu webhook
3. Ve a la pestaña **"Events"**
4. Deberías ver los eventos de tu prueba con status **"Succeeded"**

---

## 🎨 PASO 6: Dominio Personalizado (Opcional)

### 6.1 Comprar Dominio

Opciones populares:
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com
- Google Domains: https://domains.google

### 6.2 Configurar en Vercel

1. En tu proyecto de Vercel, ve a **Settings** → **Domains**
2. Click en **"Add"**
3. Ingresa tu dominio (ej: `localspace.com`)
4. Sigue las instrucciones para configurar DNS

Vercel te dará registros DNS para agregar en tu proveedor de dominio:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Espera 24-48 horas para propagación DNS
6. ✅ Tu app estará en: `https://tudominio.com`

---

## 🔐 PASO 7: Activar Modo Live (Producción Real)

⚠️ **SOLO cuando estés listo para aceptar pagos reales**

### 7.1 Activar Cuenta de Stripe

1. Ve a: https://dashboard.stripe.com
2. Completa la información de tu negocio
3. Verifica tu identidad
4. Agrega información bancaria para recibir pagos

### 7.2 Obtener Keys de Producción

1. Ve a: https://dashboard.stripe.com/apikeys (sin /test/)
2. Copia las keys de **LIVE MODE**:

```
Publishable key: pk_live_...
Secret key: sk_live_...
```

### 7.3 Actualizar Variables en Vercel

1. Ve a Settings → Environment Variables
2. Actualiza:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `STRIPE_SECRET_KEY` → `sk_live_...`
3. Configura webhook en modo LIVE:
   - https://dashboard.stripe.com/webhooks (sin /test/)
   - Usa la misma URL: `https://tudominio.com/api/webhooks/stripe`
   - Obtén el nuevo signing secret
   - Actualiza `STRIPE_WEBHOOK_SECRET`
4. **Redeploy**

---

## 📊 PASO 8: Monitoreo

### 8.1 Vercel Analytics

1. En tu proyecto de Vercel, ve a **Analytics**
2. Activa **Vercel Analytics** (gratis)
3. Monitorea:
   - Visitas
   - Rendimiento
   - Errores

### 8.2 Stripe Dashboard

Monitorea:
- Pagos exitosos
- Pagos fallidos
- Reembolsos
- Disputas

### 8.3 Supabase Dashboard

Monitorea:
- Usuarios registrados
- Bookings creados
- Queries lentas
- Uso de storage

---

## 🆘 Troubleshooting

### Error: "Stripe is not configured"

**Solución**: Verifica que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` esté configurada en Vercel

### Error: "Webhook signature verification failed"

**Solución**: 
1. Verifica que `STRIPE_WEBHOOK_SECRET` esté correctamente configurado
2. Asegúrate de que el webhook en Stripe apunte a la URL correcta
3. Redeploy después de cambiar variables de entorno

### Error: "Cannot find module '@stripe/stripe-js'"

**Solución**: 
```bash
cd frontend
npm install @stripe/stripe-js stripe
git add package.json package-lock.json
git commit -m "Add Stripe dependencies"
git push
```

### Bookings no se crean después del pago

**Solución**:
1. Verifica que el script SQL se haya ejecutado correctamente
2. Revisa los logs del webhook en Stripe Dashboard
3. Verifica las políticas RLS en Supabase

---

## ✅ Checklist Final

Antes de lanzar a producción:

- [ ] Stripe configurado en modo LIVE
- [ ] Webhooks funcionando correctamente
- [ ] Base de datos actualizada con script SQL
- [ ] Variables de entorno configuradas en Vercel
- [ ] Dominio personalizado configurado (opcional)
- [ ] Pruebas de pago completadas exitosamente
- [ ] Políticas de privacidad y términos de servicio agregados
- [ ] SSL habilitado (automático en Vercel)
- [ ] Monitoreo configurado

---

## 📞 Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎉 ¡Felicidades!

Tu aplicación Local_Space está ahora en producción con pagos integrados. 🚀

**URL de tu app**: `https://tu-proyecto.vercel.app`

---

**Última actualización**: 2026-02-05
