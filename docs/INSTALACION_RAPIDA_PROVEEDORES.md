# INSTALACIÓN RÁPIDA: Sistema de Proveedores (30 minutos)

## ⚡ 5 Pasos para Activar

### 1️⃣ Ejecutar Migraciones SQL (5 min)

En Supabase → SQL Editor, copia y ejecuta estos 3 archivos **en orden**:

```
1. database/MIGRATION_PROVIDER_CATEGORIES.sql
2. database/MIGRATION_PROVIDER_SERVICES.sql  
3. database/RLS_POLICIES_PROVIDER_APPROVAL.sql
```

✅ Verifica en Supabase → Table Editor que existan: `categories`, `provider_requests`, `provider_services`

---

### 2️⃣ Configurar Emails (5 min)

**Opción A - Resend (Fácil ⭐):**

1. Registrate: https://resend.com
2. Crea API Key
3. En `frontend/.env.local`:
```env
RESEND_API_KEY=re_xxxxx
```

**Opción B - Gmail:**

1. Google Account → Security → App passwords
2. Genera contraseña de aplicación
3. En `frontend/.env.local`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

---

### 3️⃣ Instalar Dependencia (2 min)

```bash
cd frontend
npm install nodemailer
npm install --save-dev @types/nodemailer
npm run dev
```

---

### 4️⃣ Integrar ProviderAuthGuard (3 min)

Abre: `frontend/src/app/dashboard/provider/layout.tsx`

Reemplaza el contenido con:

```tsx
import { ProviderAuthGuard } from '@/components/dashboard/ProviderAuthGuard';

export const metadata = {
  title: 'Dashboard Proveedor',
};

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProviderAuthGuard>
      {children}
    </ProviderAuthGuard>
  );
}
```

---

### 5️⃣ Crear Rol Admin (5 min)

En Supabase → SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'tu_email_admin@example.com';
```

Reemplaza con tu email de admin.

---

## 🎮 Probarlo en 2 minutos

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2 (Cliente):**
```bash
# 1. Registro de proveedor
http://localhost:3000/provider-register

# Llena form y envía
```

**Terminal 3 (Admin):**
```bash
# 2. Dashboard admin (necesita rol admin)
http://localhost:3000/dashboard/admin/provider-requests

# Aprueba solicitud
# Revisa email recibido
```

**Volver a Cliente:**
```bash
# 3. Proveedor completa perfil (después de aprobar)
# Auto-redirige a: /dashboard/provider/complete-profile
```

---

## 🔍 Verificar Funcionalidad

### ✅ Test 1: Solicitud Creada
```bash
# Verificar en Supabase
Supabase → Table Editor → provider_requests
Debería ver: 1 registro con status='pending'
```

### ✅ Test 2: Email Enviado
```bash
# Después de aprobar en admin
Ir a: http://localhost:3000/dashboard/provider/complete-profile
Debería ver: Formulario BanqueteroForm (si categoría es banquetero)
```

### ✅ Test 3: Perfil Completado
```bash
# Llenar formulario y enviar
Debería ver: Redirige a /dashboard/provider
Verificar en Supabase: profile_completed=true
```

---

## 🌐 URLs Principales

| URL | Acceso | Descripción |
|-----|--------|-------------|
| `/provider-register` | Público | Registro de proveedor |
| `/dashboard/admin/provider-requests` | Admin | Gestionar solicitudes |
| `/dashboard/provider/complete-profile` | Proveedor Aprobado | Completar perfil |
| `/dashboard/provider` | Proveedor Aprobado + Perfil Completo | Dashboard principal |

---

## 📧 Emails Automáticos

**Aprobación:**
- ✅ Enviado cuando admin hace clic "Aprobar"
- ✅ Contiene link a login
- ✅ Instrucciones para completar perfil

**Rechazo:**
- ✅ Enviado cuando admin rechaza
- ✅ Muestra razón del rechazo
- ✅ Opción de contactar soporte

---

## 🐛 Si Algo Falla

### "Estadísticas de uso de Resend"
- Solo significa que el email se envió ✅
- No es un error

### "Email no llega"
```bash
# Verifica logs
# Abre DevTools → Network → POST /api/admin/provider-requests/[id]/approve
# Revisa Response: error field
```

### "Redirige infinito"
```bash
# Actualiza manualmente en Supabase:
UPDATE providers 
SET profile_completed=true 
WHERE id='user-uuid';
```

### "No ve solicitudes en admin"
```bash
# Verifica que el usuario tiene rol 'admin'
# Ejecuta script SQL del paso 5 nuevamente
```

---

## 📊 En Supabase - Verificar Todo

```sql
-- 1. Ver categorías
SELECT * FROM categories;

-- 2. Ver solicitudes
SELECT * FROM provider_requests;

-- 3. Ver proveedores
SELECT id, email, category_id, profile_completed, approved_at 
FROM providers;

-- 4. Ver servicios
SELECT * FROM provider_services;

-- 5. Ver políticas RLS
SELECT tablename, policyname FROM pg_policies;
```

---

## ✨ Listo!

Tu sistema está operativo. Los proveedores pueden:

1. 📝 Registrarse en `/provider-register`
2. ⏳ Esperar aprobación admin
3. 📧 Recibir email de aprobación
4. 💼 Completar perfil en `complete-profile`
5. 🎯 Acceder a dashboard completo

---

**Próximo paso:** Integra el marketplace para que clientes vean a los proveedores aprobados con perfil completo.

¡Hecho! 🚀
