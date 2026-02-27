# GUÍA COMPLETA: Sistema de Aprobación de Proveedores con Perfiles Dinámicos

**Fecha de Actualización:** 27 de Febrero de 2026  
**Estado:** ✅ Implementación Completa

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Pasos de Implementación](#pasos-de-implementación)
4. [Configuración de Emails](#configuración-de-emails)
5. [Flujo Completo del Usuario](#flujo-completo-del-usuario)
6. [Pruebas de Funcionalidad](#pruebas-de-funcionalidad)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen Ejecutivo

Sistema completo de registro, aprobación y profile completion para proveedores en Canto:

✅ **Formulario de Solicitud** - Proveedores se registran con su categoría  
✅ **Dashboard Admin** - Aprobación/Rechazo de solicitudes  
✅ **Emails Automáticos** - Notificaciones aprobación/rechazo  
✅ **Perfiles Dinámicos** - Formularios específicos por categoría  
✅ **Autenticación por Rol** - Guards para proveedores aprobados  
✅ **RLS Policies** - Seguridad en Supabase  

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
Frontend:
├── /provider-register              (Formulario público)
├── /dashboard/admin/provider-requests   (Admin management)
├── /dashboard/provider/complete-profile (Profile completion)
└── /dashboard/provider             (Provider dashboard)

Backend APIs:
├── POST /api/categories            (Get categories)
├── POST /api/providers/request     (Create request)
├── GET /api/admin/provider-requests (List requests)
├── POST /api/admin/provider-requests/[id]/approve
└── POST /api/admin/provider-requests/[id]/reject

Services:
├── email-service.ts                (Send emails)
├── provider-auth.ts                (Validate provider status)
└── ProviderAuthGuard.tsx          (Protect routes)
```

### Tablas de Base de Datos

```
categories
├── id (PK)
├── name
├── slug
├── description
└── icon

provider_requests
├── id (PK, UUID)
├── name
├── email
├── phone
├── category_id (FK)
├── status (pending/approved/rejected)
├── rejection_reason
└── created_at/reviewed_at

providers (actualizada)
├── id (FK auth.users)
├── category_id (FK) [NUEVA]
├── provider_request_id (FK) [NUEVA]
├── profile_completed (BOOLEAN) [NUEVA]
├── approved_at [NUEVA]
└── ... otros campos ...

provider_services [NUEVA]
├── id (PK, UUID)
├── provider_id (FK)
├── category
├── service_name
├── description
├── datos específicos por categoría
└── created_at/updated_at
```

---

## 📦 Pasos de Implementación

### Paso 1: Ejecutar Migraciones SQL

En Supabase SQL Editor, ejecuta en orden:

```bash
# 1. Migración de categorías y solicitudes
DATABASE/MIGRATION_PROVIDER_CATEGORIES.sql

# 2. Migración de servicios de proveedores
DATABASE/MIGRATION_PROVIDER_SERVICES.sql

# 3. Políticas de seguridad RLS
DATABASE/RLS_POLICIES_PROVIDER_APPROVAL.sql
```

**Verificación:**
```sql
-- Verifica tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verifica datos iniciales
SELECT * FROM categories;
```

### Paso 2: Configurar Variables de Entorno

En `frontend/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Emails - Opción A: Resend (Recomendado)
RESEND_API_KEY=your_resend_key

# Emails - Opción B: Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_FROM=noreply@canto.com
```

### Paso 3: Instalar Dependencias

```bash
cd frontend
npm install nodemailer
npm install --save-dev @types/nodemailer

# Ya deberías tener:
# - next, react, supabase
# - shadcn/ui (button, input, card, etc)
# - sonner (toast notifications)
# - date-fns
```

### Paso 4: Integrar Components en Layout

**En `frontend/src/app/dashboard/provider/layout.tsx`:**

```tsx
import { ProviderAuthGuard } from '@/components/dashboard/ProviderAuthGuard';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderAuthGuard>
      {/* Tu layout existente */}
      {children}
    </ProviderAuthGuard>
  );
}
```

### Paso 5: Crear Rol Admin en Supabase

En Supabase, ejecuta en SQL Editor:

```sql
-- Actualizar usuarios existentes a admin si es necesario
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'admin@tu_email.com';
```

---

## 📧 Configuración de Emails

### Opción A: Resend (Recomendado ⭐)

**1. Registrate en Resend:**
- URL: https://resend.com
- Completa el registro
- Verifica tu dominio (o usa el subdominio de Resend gratis)

**2. Crea API Key:**
- Dashboard → API Keys → Create API Key
- Copia la key: `re_xxxxxxxxxxxx`

**3. Env variable:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

**4. Code automáticamente detecta y usa Resend:**
```tsx
// lib/email-service.ts detecta RESEND_API_KEY automáticamente
// No necesitas cambios adicionales
```

### Opción B: Gmail

**1. Habilita 2FA en Google:**
- Configuración de Google Account → Seguridad
- Habilita verificación en 2 pasos

**2. Genera App Password:**
- Security → App passwords
- Selecciona Mail + Windows
- Copia la contraseña de 16 caracteres

**3. Env variables:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=tu_email@gmail.com
```

### Opción C: SendGrid

```env
# SendGrid usa SMTP
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxx
```

---

## 🔄 Flujo Completo del Usuario

### Fase 1️⃣: REGISTRO DEL PROVEEDOR

**1. Usuario accede a:** `/provider-register`

```tsx
<ProviderRegistrationForm />
```

**Formulario requiere:**
- Nombre/Razón Social
- Email
- Teléfono
- Categoría (dropdown con descripciones)

**Backend guarda en:**
```
provider_requests (status='pending')
```

**Usuario ve:**
- ✅ "Solicitud enviada! Recibirás email cuando sea aprobada"

---

### Fase 2️⃣: REVISIÓN ADMIN

**1. Admin accede a:** `/dashboard/admin/provider-requests`

```tsx
<ProviderRequestsList />
```

**Muestra:**
- Tab: Pendientes (default)
- Tab: Aprobadas
- Tab: Rechazadas

**Para cada solicitud:**
- Nombre, Email, Teléfono
- Categoría con descripción
- Botón "Aprobar" / "Rechazar"
- Para Rechazar: textarea con razón

---

### Fase 2a: APROBACIÓN ✅

**Admin hace clic en "Aprobar":**

```
1. Endpoint: POST /api/admin/provider-requests/[id]/approve
2. Sistema:
   - Crea usuario en auth.users si no existe
   - Crea registro en table providers {
       provider_request_id = request.id
       category_id = category.id
       approved_at = NOW()
     }
   - Actualiza provider_requests (status='approved')
3. Envía Email:
   - sendProviderApprovalEmail()
   - Contiene link a /dashboard/provider/complete-profile
4. Admin ve confirmación
```

**Email de Aprobación:**
```
Asunto: ✅ Tu solicitud ha sido aprobada - Bienvenido a Canto

Contenido:
- Bienvenida
- Credenciales (email + contraseña temporal)
- Link a "Acceder a Mi Cuenta"
- Próximos pasos
- Footer con soporte
```

---

### Fase 2b: RECHAZO ❌

**Admin hace clic en "Rechazar":**

```
1. Admin ingresa razón (ej: "Documentación incompleta")
2. Endpoint: POST /api/admin/provider-requests/[id]/reject
3. Sistema:
   - Actualiza provider_requests (status='rejected')
   - Guarda rejection_reason
4. Envía Email:
   - sendProviderRejectionEmail()
   - Muestra razón del rechazo
   - Botón para apelar
5. Admin lo ve listado en tab "Rechazadas"
```

---

### Fase 3️⃣: COMPLETAR PERFIL

**1. Proveedor aprobado inicia sesión**

```
Sistema detecta:
- providers.approved_at != NULL
- providers.profile_completed = false

Redirige automáticamente a:
/dashboard/provider/complete-profile
```

**2. ProviderAuthGuard valida:**

```tsx
const status = await getProviderStatus(user.id);

if (!status.isApproved) {
  router.push('/');  // No aprobado
}

if (status.needsCompleteProfile) {
  router.push('/dashboard/provider/complete-profile');
}
```

**3. Página muestra:**

```
Título: "Último paso"
Subtítulo: "Completa tu información para comenzar a recibir reservas"

Barra de progreso (0%)

Según su categoría:
- SI categoría='banquetero' → <BanqueteroForm />
- SI categoría='rentador-local' → <RentadorLocalServiceForm />
- OTRO → Alert "Categoría sin formulario todavía"
```

---

### Fase 3a: FORMULARIO BANQUETERO

**Campos requeridos:**

```
Nombre del Negocio
├─ Empresa de Catering XYZ

Descripción de Servicios
├─ Descripción detallada

Capacidad Máxima *
├─ Número de personas (ej: 150)

Mínimo de Invitados
├─ Número (ej: 30)

Precio por Persona (€) *
├─ 35.50

Tipos de Cocina
├─ Mediterránea, Internacional, Fusión

Opciones Dietéticas
├─ Vegana, Sin gluten, Halal

Servicios Incluidos
├─ Chef, Meseros, Decoración
```

**Al enviar:**
```sql
INSERT INTO provider_services {
  provider_id = current_user,
  category = 'banquetero',
  service_name = 'Empresa de Catering XYZ',
  description = '...',
  capacity = 150,
  min_guests = 30,
  price_per_person = 35.50,
  cuisine_types = '...',
  dietary_options = '...',
  services_included = '...'
}
```

---

### Fase 3b: FORMULARIO RENTADOR LOCAL

**Campos requeridos:**

```
Nombre del Local *
├─ Mi Salón de Eventos

Descripción del Espacio *
├─ Descripción completa

Ubicación/Dirección
├─ Ciudad, zona, referencias

Capacidad Máxima *
├─ 200 personas

Metros Cuadrados
├─ 500 m²

Precio por Hora (€) *
├─ 50.00

Precio por Día (€)
├─ 300.00

Amenidades
├─ Aire acondicionado, Iluminación LED

¿Tiene Estacionamiento?
├─ Sí/No/Detalles

¿Permite Catering Externo?
├─ Sí/No/Restricciones
```

---

### Fase 4️⃣: PERFIL COMPLETADO

**Después de enviar formulario:**

```
1. BanqueteroForm / RentadorLocalForm
   - Valida campos
   - Guarda en provider_services
   
2. Llama onComplete()
   
3. ProfileCompletionForm:
   - Ejecuta handleCompletion()
   - UPDATE providers SET profile_completed=true WHERE id=user.id
   
4. Toast: "¡Perfil completado! Redirigiendo..."
   
5. Redirige a: /dashboard/provider
   
6. ProviderAuthGuard verifica:
   - isApproved = true ✅
   - profileCompleted = true ✅
   - Permite acceso al dashboard
```

**Proveedor ahora puede:**
- Ver perfil
- Gestionar disponibilidad
- Recibir reservas
- Ver bookings
- Completar más fotos

---

## 🧪 Pruebas de Funcionalidad

### Test 1: Crear Solicitud

```bash
# 1. Accede a: http://localhost:3000/provider-register

# 2. Llena form:
Name: "Catering XYZ"
Email: "test@catering.com"
Phone: "+34 123 45 67"
Category: "Banquetero"

# 3. Envía

# Esperado: 
✅ "Solicitud exitosa. Esperando aprobación"
✅ Registro en provider_requests (status='pending')
```

### Test 2: Aprobar Solicitud

```bash
# 1. Admin accede a: http://localhost:3000/dashboard/admin/provider-requests

# 2. Ve solicitud "Catering XYZ"

# 3. Hace clic "Aprobar"

# Esperado:
✅ Usuario creado en auth
✅ Proveedor creado en providers
✅ provider_requests status='approved'
✅ Email enviado a test@catering.com
✅ Solicitud se mueve a tab "Aprobadas"
```

### Test 3: Completar Perfil

```bash
# 1. Proveedor recibe email con link de login

# 2. Inicia sesión en: http://localhost:3000/dashboard/provider

# Esperado:
✅ Auto-redirige a /complete-profile
✅ Muestra BanqueteroForm
✅ Llena datos y envía

# 3. Tras completar:
✅ profile_completed = true
✅ Redirige a dashboard
✅ Puede navegar sin restricciones
```

### Test 4: Rechazar Solicitud

```bash
# 1. Nueva solicitud pendiente

# 2. Admin hace clic "Rechazar"

# 3. Ingresa razón: "Datos incompletos"

# 4. Confirma

# Esperado:
✅ provider_requests status='rejected'
✅ rejection_reason guardada
✅ Email enviado con razón
✅ Solicitud listada en tab "Rechazadas"
```

---

## 🔐 Verificación de Seguridad

### RLS Policies Activas

```sql
-- categories
- Lectura: Todos
- Escritura: Solo admin

-- provider_requests
- Lectura Admin: Todas
- Lectura Proveedor: Solo si es propietario
- Creación: Pública (sin auth)

-- providers
- Lectura Pública: Solo profile_completed=true
- Lectura Proveedor: Solo su perfil
- Lectura Admin: Todas
```

**Verificar en Supabase:**
```
Dashboard → Authentication → Policies
Verificar que todas las policies estén habilitadas (verde)
```

---

## 🐛 Troubleshooting

### Error: "Categoría no válida"

**Solución:**
```sql
-- Verifica que las categorías existen
SELECT * FROM categories;

-- Si está vacío, inserta:
INSERT INTO categories (name, slug, description) VALUES
('Banquetero', 'banquetero', 'Servicios de catering'),
('Rentador de Local', 'rentador-local', 'Alquiler de espacios');
```

### Error: "Email no enviado"

**Verifica:**
1. `RESEND_API_KEY` o credenciales de email en `.env.local`
2. Reinicia servidor: `npm run dev`
3. Revisa logs: `console.error` en email-service.ts
4. Verifica firewall/antivirus no bloquea puertos

### Error: "Usuario no encontrado"

**Solución:**
```sql
-- Verifica que el usuario existe en auth
SELECT id, email FROM auth.users WHERE email='test@catering.com';

-- Si no existe, Supabase lo crea automáticamente
-- (el endpoint de aprobación lo hace)
```

### Error: "Perfil no se guarda"

**Verifica:**
1. RLS Policy permite UPDATE en providers
2. provider_id existe en tabla providers
3. Revisa Network tab en DevTools → Response del API

```sql
-- Debug: ver permisos
SELECT * FROM information_schema.role_table_grants 
WHERE table_name='providers';
```

### Provider redirigido infinitamente

**Causa:**
- ProviderAuthGuard está activo pero profile_completed=false

**Solución:**
```sql
-- Actualizar manualmente:
UPDATE providers 
SET profile_completed=true 
WHERE id='user-uuid';
```

---

## ✅ Checklist Final

- [ ] Migraciones SQL ejecutadas (3 archivos)
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (nodemailer)
- [ ] ProviderAuthGuard integrado en layout
- [ ] Rol admin asignado a usuarios
- [ ] RLS policies habilitadas
- [ ] Emails configurados (Resend o Gmail)
- [ ] Test: Crear solicitud
- [ ] Test: Aprobar solicitud + email recibido
- [ ] Test: Completar perfil
- [ ] Test: Rechazar solicitud + email recibido
- [ ] Documentación actualizada
- [ ] Deploy a staging/producción

---

## 📚 Archivos Creados/Modificados

**Nuevos Archivos:**
- `database/MIGRATION_PROVIDER_CATEGORIES.sql`
- `database/MIGRATION_PROVIDER_SERVICES.sql`
- `database/RLS_POLICIES_PROVIDER_APPROVAL.sql`
- `lib/email-service.ts`
- `lib/provider-auth.ts`
- `app/api/categories/route.ts`
- `app/api/providers/request/route.ts`
- `app/api/admin/provider-requests/route.ts`
- `app/api/admin/provider-requests/[id]/approve/route.ts`
- `app/api/admin/provider-requests/[id]/reject/route.ts`
- `components/forms/ProviderRegistrationForm.tsx`
- `components/forms/ProfileCompletionForm.tsx`
- `components/forms/BanqueteroForm.tsx` (actualizado)
- `components/forms/RentadorLocalServiceForm.tsx` (nuevo)
- `components/dashboard/ProviderRequestsList.tsx`
- `components/dashboard/ProviderAuthGuard.tsx`
- `app/(auth)/provider-register/page.tsx`
- `app/dashboard/provider/complete-profile/page.tsx`
- `app/dashboard/admin/provider-requests/page.tsx`

**Modificados:**
- `.env.local` (agregar variables de email)

---

## 🎉 Conclusión

Sistema completo y seguro para onboarding de proveedores:

✅ Registro público sin complicaciones  
✅ Revisión manual por admin  
✅ Comunicación automática por email  
✅ Perfiles dinámicos según categoría  
✅ Seguridad con RLS policies  
✅ Guards para rutas protegidas  

**¡Listo para producción!** 🚀
