# 🚀 PASOS RÁPIDOS PARA DEPLOYMENT

## ⚡ Inicio Rápido (15 minutos)

### 1️⃣ Ejecutar Script SQL en Supabase (2 min)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **SQL Editor** → **New query**
4. Copia y pega el contenido de: `db_scripts/stripe_integration.sql`
5. Click en **Run**

---

### 2️⃣ Crear Repositorio del Backend (3 min)

```bash
cd C:\Users\angel\Desktop\canto_backend
git init
git add .
git commit -m "Initial backend with Stripe integration"
```

**En GitHub:**
- Crea nuevo repositorio: `canto_backend`
- Copia la URL

```bash
git remote add origin https://github.com/Overland865/canto_backend.git
git branch -M main
git push -u origin main
```

---

### 3️⃣ Desplegar Backend en Render (5 min)

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. **New +** → **Web Service**
3. Conecta `canto_backend`
4. Configuración:
   - Name: `canto-backend`
   - Build: `npm install`
   - Start: `npm start`

5. **Environment Variables** (copia y pega):

```
PORT=3000
NODE_ENV=production
SUPABASE_URL=TU_SUPABASE_URL
SUPABASE_KEY=TU_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY=sk_live_TU_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET
FRONTEND_URL=https://canto-proyect.vercel.app
ALLOWED_ORIGIN=https://canto-proyect.vercel.app
```

6. Click **Create Web Service**

⏳ **Espera 3-5 min** mientras despliega.

**Copia tu URL**: `https://canto-backend-XXXXX.onrender.com`

---

### 4️⃣ Configurar Frontend en Vercel (3 min)

**Ya tienes el proyecto en Vercel, solo actualiza:**

1. **Settings** → **Environment Variables**
2. **Agrega** (o edita si existe):

```
NEXT_PUBLIC_BACKEND_URL=https://canto-backend-XXXXX.onrender.com
```
*(Usa tu URL real de Render)*

3. **Deployments** → **Redeploy** (botón de 3 puntos)

---

### 5️⃣ Configurar Webhook de Stripe (2 min)

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**
3. **URL**: `https://canto-backend-XXXXX.onrender.com/stripe/webhook`
4. **Eventos**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. **Add endpoint**
6. **Copiar** el Signing Secret (`whsec_...`)

**Actualizar en Render:**
1. Environment → Editar `STRIPE_WEBHOOK_SECRET`
2. Pegar el secret
3. Save → Redeploy automático

---

## ✅ Verificación (1 min)

### Probar Backend
Abre: `https://canto-backend-XXXXX.onrender.com/health`

Deberías ver:
```json
{
  "status": "OK",
  "message": "Servidor Local_Space funcionando correctamente"
}
```

### Probar Frontend
1. Abre: `https://canto-proyect.vercel.app`
2. Ve al marketplace
3. Selecciona un servicio
4. Click "Reservar y Pagar"
5. Usa tarjeta de prueba: `4242 4242 4242 4242`
6. Completa el pago
7. Verifica que te redirija a `/payment/success`
8. Verifica en Supabase que se creó el booking

---

## 🎉 ¡Listo!

Tu aplicación está en producción con:
- ✅ Frontend en Vercel
- ✅ Backend en Render
- ✅ Pagos con Stripe (LIVE MODE)
- ✅ Base de datos en Supabase

---

## 🐛 Problemas Comunes

### Backend se duerme (Render Free)
**Solución**: Primera petición toma ~30 segundos. Es normal en plan gratuito.

### Error CORS
**Solución**: Verifica que `ALLOWED_ORIGIN` en Render coincida exactamente con tu URL de Vercel.

### Webhook no funciona
**Solución**: 
1. Verifica que el endpoint en Stripe sea correcto
2. Asegúrate de que `STRIPE_WEBHOOK_SECRET` esté actualizado
3. Revisa los logs en Render

### Error 404 al pagar
**Solución**: Verifica que `NEXT_PUBLIC_BACKEND_URL` en Vercel apunte a tu URL de Render.

---

**Documentación completa**: Ver `DEPLOYMENT_SUMMARY.md`
