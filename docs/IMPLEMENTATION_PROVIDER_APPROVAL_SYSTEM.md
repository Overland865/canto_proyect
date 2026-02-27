# Guía de Implementación: Sistema de Aprobación de Proveedores

## 📋 Resumen

Este documento detalla la implementación completa del sistema de categorías y aprobación de proveedores para la plataforma Canto.

## 🗂️ Archivos Creados

### Base de Datos
- **MIGRATION_PROVIDER_CATEGORIES.sql** - Migración SQL completa
  - Crea tabla `categories`
  - Crea tabla `provider_requests`
  - Actualiza tabla `providers` con nuevas columnas
  - Inserta categorías iniciales
  - Crea índices de performance

### API Backend Endpoints
1. **api/categories/route.ts** - GET
   - Obtiene todas las categorías disponibles

2. **api/providers/request/route.ts** - POST
   - Crea nueva solicitud de proveedor
   - Valida datos y categoría
   - Retorna ID de solicitud

3. **api/admin/provider-requests/route.ts** - GET
   - Obtiene solicitudes (filtrables por estado: pending, approved, rejected)
   - Incluye datos de categoría

4. **api/admin/provider-requests/[id]/approve/route.ts** - POST
   - Aprueba solicitud de proveedor
   - Crea usuario en Auth si no existe
   - Crea registro en tabla `providers`
   - Actualiza estado de solicitud

5. **api/admin/provider-requests/[id]/reject/route.ts** - POST
   - Rechaza solicitud
   - Requiere razón de rechazo
   - Actualiza estado de solicitud

### Componentes Frontend
1. **ProviderRegistrationForm.tsx**
   - Formulario de registro público para nuevos proveedores
   - Selector de categoría con descripciones
   - Validaciones en cliente
   - Toast notifications con feedback

2. **ProviderRequestsList.tsx**
   - Dashboard admin para gestionar solicitudes
   - Filtros por estado (pending, approved, rejected)
   - Botones de aprobar/rechazar
   - Diálogo para razón de rechazo
   - Tiempo relativo de solicitud

### Páginas
1. **(auth)/provider-register/page.tsx**
   - Página pública de registro de proveedores
   - URL: `/provider-register`
   - Accesible sin autenticación

2. **dashboard/admin/provider-requests/page.tsx**
   - Página admin para gestionar solicitudes
   - URL: `/dashboard/admin/provider-requests`
   - Requiere autenticación admin

## 📝 Pasos de Implementación

### 1. Ejecutar Migración de Base de Datos

```bash
# Conectate a tu base de datos Supabase
# Copia y ejecuta el contenido de: database/MIGRATION_PROVIDER_CATEGORIES.sql

# O usando supabase-cli:
supabase db push
```

**Verificación:**
- [ ] Tabla `categories` creada con 6 categorías
- [ ] Tabla `provider_requests` creada
- [ ] Columnas en `providers`: category_id, provider_request_id, approved_at
- [ ] Índices creados

### 2. Configurar Variables de Entorno

Asegúrate de tener en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Instalar Dependencias (si es necesario)

```bash
npm install
# sonner, date-fns, shadcn/ui - deberían estar instaladas ya
```

### 4. Verificar RLS (Row Level Security)

En Supabase, configura políticas de RLS:

```sql
-- Para tabla: categories
-- Todos pueden leer
CREATE POLICY "Allow public read" ON categories
  FOR SELECT USING (true);

-- Para tabla: provider_requests
-- Solo puede ver admin o el solicitante
CREATE POLICY "Allow public insert provider requests" ON provider_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read provider requests" ON provider_requests
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### 5. Crear Función de Email (Opcional)

Para enviar emails de aprobación/rechazo:

```sql
-- Crear función en Supabase
CREATE OR REPLACE FUNCTION send_provider_approval_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Aquí iría el código para enviar email usando una extensión
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_approval_email
  AFTER UPDATE ON provider_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION send_provider_approval_email();
```

### 6. Testing de Endpoints

```bash
# 1. Obtener categorías
curl http://localhost:3000/api/categories

# 2. Crear solicitud de proveedor
curl -X POST http://localhost:3000/api/providers/request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Banquete",
    "email": "info@mibanquete.com",
    "phone": "+34 123 45 67 89",
    "category_id": 1
  }'

# 3. Obtener solicitudes pendientes
curl http://localhost:3000/api/admin/provider-requests?status=pending

# 4. Aprobar solicitud
curl -X POST http://localhost:3000/api/admin/provider-requests/{REQUEST_ID}/approve

# 5. Rechazar solicitud
curl -X POST http://localhost:3000/api/admin/provider-requests/{REQUEST_ID}/reject \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "Documentación incompleta"
  }'
```

## 🔗 URLs de Acceso

### Para Proveedores
- **Registro:** `http://localhost:3000/provider-register`
- El formulario carga las categorías automáticamente
- Se envía una solicitud que queda en estado `pending`

### Para Administradores
- **Gestión:** `http://localhost:3000/dashboard/admin/provider-requests`
- Vista de solicitudes filtrable por estado
- Botones de aprobar/rechazar en tiempo real

## 🔄 Flujo Completo

### Fase 1: Registro
1. Nuevo proveedor va a `/provider-register`
2. Selecciona su categoría (ej: Banquetero)
3. Proporciona: nombre, email, teléfono
4. Envía solicitud → se crea registro en `provider_requests` con `status='pending'`
5. Usuario recibe mensaje de confirmación

### Fase 2: Aprobación Admin
1. Admin va a `/dashboard/admin/provider-requests`
2. Ve solicitud en tab "Pendientes"
3. Revisa información y categoría
4. Hace clic en "Aprobar"
5. Sistema crea usuario en Auth y registro en `providers`
6. Solicitud pasa a `status='approved'`

### Fase 3: Acceso Proveedor (Después de Aprobación)
1. Proveedor recibe email con credenciales (implementar después)
2. Inicia sesión en la plataforma
3. Ve dashboard con su categoría
4. Completa su perfil con datos específicos de su categoría (BanqueteroForm, RentadorLocalForm)
5. Puede aceptar reservas

### Fase 4: Rechazo (Si aplica)
1. Admin selecciona "Rechazar"
2. Admin proporciona razón de rechazo
3. Solicitud pasa a `status='rejected'`
4. Sistema podría enviar email de rechazo (implementar después)

## 🎯 Próximos Pasos

Después de esta implementación, completar:

1. **Integración de Emails**
   - Email de bienvenida después de aprobación
   - Email de rechazo con razón
   - Email de recordatorio de perfil incompleto

2. **Perfil Completo por Categoría**
   - Después de aprobación, redirigir a BanqueteroForm o RentadorLocalForm
   - Validar que se completen todos los campos requeridos
   - Guardar datos en tabla de servicios específica

3. **Dashboard de Proveedor Actualizado**
   - Mostrar indicador de categoría
   - Mostrar estado de aprobación
   - Formulario dinámico según categoría

4. **Notificaciones**
   - Email a admin cuando hay solicitud nueva
   - Email a proveedor con resultado (aprobado/rechazado)
   - Notificación en app cuando categoría es aprobada

5. **Seguridad**
   - Validar que solo admins pueden ver solicitudes
   - Validar email único
   - Rate limiting en endpoint de solicitud

## 📊 Diagrama de Base de Datos

```
categories
  - id (PK)
  - name
  - slug
  - description
  - icon
  - created_at

provider_requests
  - id (PK, UUID)
  - name
  - email
  - phone
  - category_id (FK → categories.id)
  - status (pending, approved, rejected)
  - rejection_reason
  - created_at
  - reviewed_at
  - reviewed_by

providers (actualizada)
  - id (FK → auth.users)
  - name
  - email
  - category_id (FK → categories.id) [NUEVA]
  - provider_request_id (FK → provider_requests.id) [NUEVA]
  - approved_at [NUEVA]
  - ... otras columnas existentes ...
```

## 🐛 Troubleshooting

### Error: "Categoría no válida"
- Verificar que las categorías se insertaron en la BD
- Verificar que `category_id` existe en tabla `categories`

### Error: "Error al crear usuario"
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` es correcto
- Revisar logs en Supabase dashboard

### Formulario no carga categorías
- Verificar que `/api/categories` devuelve datos
- Revisar Network tab en DevTools
- Verificar RLS policies en tabla `categories`

### Admin no ve solicitudes
- Verificar que usuario tiene rol `admin`
- Verificar RLS policies en tabla `provider_requests`
- Revisar token JWT en Supabase

## ✅ Checklist de Implementación Final

- [ ] Base de datos migrada
- [ ] API endpoints funcionando
- [ ] Formulario de registro accesible en `/provider-register`
- [ ] Dashboard admin en `/dashboard/admin/provider-requests`
- [ ] Pruebas de crear solicitud (status=pending)
- [ ] Pruebas de aprobar solicitud (status=approved, usuario creado)
- [ ] Pruebas de rechazar solicitud (status=rejected, razón guardada)
- [ ] RLS policies configuradas
- [ ] Emails de notificación implementados
- [ ] Perfiles completos por categoría
- [ ] Documentación de usuario finalizada
