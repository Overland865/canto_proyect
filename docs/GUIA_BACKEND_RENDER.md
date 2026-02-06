# 🚀 Guía de Deployment del Backend en Render

Esta guía explica cómo desplegar tu servidor **Node.js/Express** en Render.com y cómo configurarlo para trabajar con la nueva integración de pagos.

---

## 🛠️ Paso 1: Preparación del Código (En tu carpeta del Backend)

### 1.1 Verificar `package.json`
Asegúrate de que tu `package.json` tenga el script `start`:

```json
"scripts": {
  "start": "node index.js", 
  "dev": "nodemon index.js"
}
```
*(Asegúrate de que `index.js` sea tu archivo principal, a veces es `src/index.js` o `server.js`)*.

### 1.2 Configurar el Puerto
Tu código debe escuchar en el puerto que Render le asigne. Verifica tu archivo principal:

```javascript
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

### 1.3 Ignorar archivos innecesarios
Crea un archivo `.gitignore` si no lo tienes:
```
node_modules
.env
```

---

## ☁️ Paso 2: Subir a GitHub

Si este backend aún no está en GitHub:
1. Crea un repositorio nuevo en GitHub (ej: `canto-backend`).
2. Sube tu código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/Overland865/canto-backend.git
   git push -u origin main
   ```

---

## 🚀 Paso 3: Configurar Render

1. Crea una cuenta en [dashboard.render.com](https://dashboard.render.com).
2. Click en **"New +"** → **"Web Service"**.
3. Conecta tu repositorio de GitHub.
4. Configura el servicio:
   - **Name**: `canto-backend`
   - **Region**: Oregon (US West) o la más cercana.
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

---

## 🔑 Paso 4: Variables de Entorno

En Render, ve a la pestaña **Environment**. Agrega las siguientes variables:

| Key | Value |
|-----|-------|
| `PORT` | `3000` (o el que uses por defecto) |
| `SUPABASE_URL` | `https://ouyshfzqmkdykgnkltbj.supabase.co` |
| `SUPABASE_KEY` | `eyJhbGciOiJIUz...` (Tu service_role key o anon key) |
| `DB_HOST` | `aws-0-us-east-1.pooler.supabase.com` |
| `DB_PASSWORD` | (Tu contraseña de base de datos) |
| `DB_USER` | `postgres.ouyshfzqmkdykgnkltbj` |
| `DB_NAME` | `postgres` |

*(Ajusta estas variables según lo que use tu código actual para conectarse).*

---

## 💳 Paso 5: Actualización sobre Stripe

Como los pagos ahora se procesan en el Frontend (Next.js), el Backend **NO** necesita procesar tarjetas ni tener claves privadas de Stripe por ahora.

Sin embargo, el Backend debe ser consciente de los cambios en la Base de Datos:

1. **Tabla `bookings` nueva estructura**:
   - `payment_status`: 'pending' | 'paid' | 'failed'
   - `amount_paid`: número
   - `paid_at`: fecha

2. **Si el Backend tiene endpoints que leen reservas (`GET /reservas`)**:
   - Asegúrate de que tu consulta SQL o Supabase Client traiga estos nuevos campos para mostrarlos en la app móvil o dashboard.

---

## ✅ Comprobación Final

1. Click en **"Create Web Service"**.
2. Espera a que termine el deploy.
3. Render te dará una URL (ej: `https://canto-backend.onrender.com`).
4. **Prueba**: Entra a esa URL (o a un endpoint de salud como `/api/health`) para ver si responde.

---

**Nota**: Una vez desplegado, asegúrate de actualizar tu Frontend y App Móvil para que apunten a esta nueva URL de Render en lugar de `localhost:3000`.
