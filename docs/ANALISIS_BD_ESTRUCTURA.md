# 🗄️ ANÁLISIS ESTRUCTURA BASE DE DATOS

**Comparativa: Sistema Existente vs. Nuevo**

---

## 📊 TABLAS EXISTENTES (FINAL_DB_SCHEMA.sql)

```sql
✅ PROFILES (Tabla Base)
   ├─ id (UUID, PK)
   ├─ email (unique)
   ├─ role (guest|consumer|provider|admin)
   ├─ full_name, phone, avatar_url
   └─ created_at

✅ PROVIDER_PROFILES (Extensión de profiles)
   ├─ id (UUID, FK → profiles.id)
   ├─ business_name (required)
   ├─ contact_phone
   ├─ categories (TEXT[]) ← ARRAY DIRECTO
   ├─ status (pending|approved|rejected|disabled)
   ├─ description, logo_url
   └─ social_media (JSONB)

✅ OTHER TABLES
   ├─ services (id, provider_id, category, title, price...)
   ├─ bookings (id, user_id, provider_id, service_id...)
   ├─ provider_availability (id, provider_id, date, status...)
   └─ notifications (id, user_id, type, message...)
```

---

## 📊 TABLAS NUEVAS (Yo las creo)

### Tabla 1: CATEGORIES ✅

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,        -- Banquetero, Rentador de Local, etc
    slug VARCHAR(255) UNIQUE,        -- banquetero, rentador-local
    description TEXT,                -- "Servicios de catering..."
    icon VARCHAR(100),               -- icono (emoji, url, etc)
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO categories VALUES:
1  | Banquetero        | banquetero        | Servicios de catering...
2  | Rentador de Local | rentador-local    | Alquiler de espacios...
3  | Decoración        | decoracion        | Servicios de decoración...
4  | Fotografía        | fotografia        | Servicios de foto/video...
5  | DJ y Música       | dj-musica         | Servicios de música...
6  | Transporte        | transporte        | Servicios de transporte...
```

**POR QUÉ:**
- ❌ ANTES: categories TEXT[] (directo en provider_profiles)
  - Problema: No hay relación directa
  - Problema: No se puede validar en BD
  - Problema: Búsquedas complicadas
  
- ✅ AHORA: Tabla normalizada
  - Solución: Relación FK
  - Solución: Constraint unique(name)
  - Solución: Índices rápidos

---

### Tabla 2: PROVIDER_REQUESTS ✅

```sql
CREATE TABLE provider_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),              -- Nombre del negocio
    email VARCHAR(255),             -- Email contacto
    phone VARCHAR(20),              -- Teléfono
    category_id INT NOT NULL,       -- FK → categories.id
    status VARCHAR(50) DEFAULT 'pending',  -- pending|approved|rejected
    rejection_reason TEXT,          -- Razón si es rechazado
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,          -- Cuándo fue revisado
    reviewed_by UUID,               -- Quién lo revisó (admin)
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

EJEMPLOS DE DATOS:
id                                | name              | email           | category_id | status   | rejection_reason
550e8400-e29b-41d4-a716-*****     | Mi Banquete       | info@...        | 1           | pending  | NULL
550e8400-e29b-41d4-a716-*****     | Salón XYZ         | eventos@...     | 2           | approved | NULL
550e8400-e29b-41d4-a716-*****     | Catering Delicia  | contacto@...    | 1           | rejected | Documentación incompleta
```

**POR QUÉ:**
- ❌ ANTES: Solicitudes guardadas directo en provider_profiles con status='pending'
  - Problema: Mezcla datos de solicitud con datos de proveedor
  - Problema: No hay separación clara
  - Problema: Difícil rastrear rechazos
  
- ✅ AHORA: Tabla separada
  - Solución: Flujo claro: solicitud → aprobación → proveedor
  - Solución: Razón de rechazo guardada
  - Solución: Auditoría (reviewed_by, reviewed_at)
  - Solución: Email automático

**FLUJO:**
```
1. Usuario envía solicitud → INSERT provider_requests (status='pending')
2. Admin lo ve → /api/admin/provider-requests?status=pending
3. Admin aprueba → 
   - INSERT providers (con category_id)
   - UPDATE provider_requests (status='approved')
   - SEND EMAIL
4. O Admin rechaza →
   - UPDATE provider_requests (status='rejected', rejection_reason='...')
   - SEND EMAIL
```

---

### Tabla 3: PROVIDER_SERVICES ✅

```sql
CREATE TABLE provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL (FK → providers.id),
    category VARCHAR(50),           -- banquetero|rentador-local|etc
    service_name VARCHAR(255),      -- "Mi Banquete XYZ"
    description TEXT,               -- Descripción larga
    
    -- Campos Banquetero
    capacity INT,                   -- Capacidad máxima
    min_guests INT,                 -- Mínimo de invitados
    price_per_person DECIMAL(10,2), -- Precio por persona
    cuisine_types TEXT,             -- Tipos de cocina
    dietary_options TEXT,           -- Opciones dietéticas
    services_included TEXT,         -- Lo que incluye
    
    -- Campos Rentador Local
    square_meters INT,              -- m² del local
    price_per_hour DECIMAL(10,2),   -- Precio por hora
    price_per_day DECIMAL(10,2),    -- Precio por día
    location TEXT,                  -- Ubicación
    amenities TEXT,                 -- Amenidades
    parking_available BOOLEAN,      -- Estacionamiento
    catering_allowed BOOLEAN,       -- Permite catering externo
    
    -- Campos generales
    photos JSON,                    -- Fotos (URLs)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    UNIQUE(provider_id)
);

EJEMPLOS:
id          | provider_id | category  | service_name | capacity | price_per_person | ...
uuid1       | uuid-prov   | banquetero| Mi Banquete  | 150      | 35.50            | ...
uuid2       | uuid-prov2  | rentador  | Salón XYZ    | 200      | 50.00            | ...
```

**POR QUÉ:**
- ❌ ANTES: No existe tabla de servicios con detalles por categoría
  - Problema: Tabla `services` es genérica
  - Problema: No captura campos específicos de cada categoría
  
- ✅ AHORA: Tabla especializada para categorías
  - Solución: Campos específicos por categoría
  - Solución: Flexibilidad (más campos se agregan sin migración)
  - Solución: UNIQUE(provider_id) → Un proveedor = un servicio
  - Solución: Relación directa con proveedor aprobado

**DIFERENCIA CON `services` EXISTENTE:**
```
services (genérica)
├─ title: string
├─ description: string  
├─ price: numeric
├─ category: string (hardcoded)
└─ image_url, gallery

provider_services (especializada)
├─ service_name: string
├─ description: text
├─ CAMPOS DINÁMICOS según categoría
├─ category: banquetero|rentador-local|etc
├─ photos: JSON
└─ ÚNICA POR PROVEEDOR
```

**NOTA:** Ambas tablas pueden coexistir sin conflicto

---

## 🔄 CAMBIOS EN TABLA EXISTENTE: PROVIDERS

```sql
ANTES (FINAL_DB_SCHEMA):
   ├─ Tabla NO EXISTE tal cual
   ├─ Usa provider_profiles como extensión de profiles

DESPUÉS (con mis cambios):
   Tabla: providers (nueva normalización)
   ├─ id (UUID, FK → auth.users)
   ├─ name, email
   ├─ category_id (FK → categories.id) ← NUEVA
   ├─ provider_request_id (FK → provider_requests.id) ← NUEVA
   ├─ profile_completed BOOLEAN DEFAULT false ← NUEVA
   ├─ approved_at TIMESTAMP ← NUEVA
   └─ ... otros campos ...

MIGRACIÓN SQL:
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS category_id INT;
ADD COLUMN IF NOT EXISTS provider_request_id UUID;
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
```

**IMPACTO:**
- ⚠️ Afecta tabla existente pero NO la borra
- ✅ Solo agrega columnas
- ✅ Compatible con código existente

---

## 📈 RESUMEN CAMBIOS BD

| Tabla | Acción | Impacto | Riesgo |
|-------|--------|--------|--------|
| categories | 🟢 CREATE | Da estructura a categorías | BAJO |
| provider_requests | 🟢 CREATE | Nuevo flujo de aprobación | BAJO |
| provider_services | 🟢 CREATE | Servicios específicos por cat. | BAJO |
| providers | 🟡 ALTER | +4 columnas | MUY BAJO |
| profiles | ⚫ NADA | No se modifica | CERO |
| provider_profiles | ⚫ NADA | No se modifica (coexiste) | CERO |
| services | ⚫ NADA |No se modifica (coexiste) | CERO |
| bookings | ⚫ NADA | No se modifica | CERO |

---

## 🔐 RLS POLICIES (Seguridad)

### ANTES (Básicas en FINAL_DB_SCHEMA.sql)

```sql
✅ categories
   - Lectura: Pública (anyone)

✅ provider_requests
   - No existe tabla, no hay policies

✅ provider_services
   - No existe tabla, no hay policies

✅ provider_profiles
   - Lectura: Pública
   - Escritura: Solo propietario
```

### DESPUÉS (Yo agrego RLS_POLICIES_PROVIDER_APPROVAL.sql)

```sql
✅ categories
   - SELECT: true (público)
   - INSERT/UPDATE/DELETE: Admin solo

✅ provider_requests
   - INSERT: true (sin auth, registro público)
   - SELECT Admin: Todas
   - SELECT Proveedor: Solo su solicitud
   - UPDATE: Admin solo

✅ provider_services
   - SELECT: true (público si profile_completed=true)
   - INSERT/UPDATE: Proveedor propietario
   - DELETE: Proveedor propietario

✅ provider_profiles
   - SELECT: true (público si approved=true)
   - UPDATE: Propietario o admin
```

---

## ✅ VALIDACIÓN DE DISEÑO

### Normalization (3NF)

```
✅ categories
   - 1NF: Atomic attributes
   - 2NF: Depends on PK
   - 3NF: No transitive dependencies

✅ provider_requests
   - FK a categories (no duplicate categoría)

✅ provider_services
   - FK a providers (no duplicate proveedor)
   - UNIQUE(provider_id) → Una fila por proveedor
```

### Integridad Referencial

```
✅ provider_requests.category_id → categories.id (obligatorio)
✅ provider_services.provider_id → providers.id (on delete cascade)
✅ providers.category_id → categories.id
✅ providers.provider_request_id → provider_requests.id
```

### Índices para Performance

```sql
CREATE INDEX idx_provider_requests_status ON provider_requests(status);
CREATE INDEX idx_provider_requests_category ON provider_requests(category_id);
CREATE INDEX idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX idx_provider_services_category ON provider_services(category);
CREATE INDEX idx_categories_slug ON categories(slug);
```

---

## 🚨 CHECKLIST ANTES DE HACER MIGRATE

- [ ] Backup Supabase actual
- [ ] Leer MIGRATION_PROVIDER_CATEGORIES.sql completo
- [ ] Leer MIGRATION_PROVIDER_SERVICES.sql completo
- [ ] Leer RLS_POLICIES_PROVIDER_APPROVAL.sql completo
- [ ] Ir a Supabase SQL Editor
- [ ] Copiar y pegar script 1 (categorías)
- [ ] Verificar que se creó tabla
- [ ] Copiar y pegar script 2 (servicios)
- [ ] Verificar que se creó tabla
- [ ] Copiar y pegar script 3 (RLS)
- [ ] Enabler RLS en todas las tablas
- [ ] ✅ DONE

---

## 📋 CONCLUSIÓN

**ESTADO BD ACTUAL:**
- ❌ Incompleta para flujo de aprobación con categorías

**ESTADO BD DESPUÉS:**
- ✅ Completa y normalizada
- ✅ 3 tablas nuevas
- ✅ 4 columnas nuevas en providers
- ✅ RLS policies avanzadas
- ✅ Índices para performance

**RIESGO:** 🟢 BAJO
- No se modifica nada existente (solo se agrega)
- Compatible 100% con código actual
- Backup antes de ejecutar

**TIEMPO:** 5 minutos
- 3 scripts SQL

