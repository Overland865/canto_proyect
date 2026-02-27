# Flujo de Categorías para Proveedores

## 📋 Descripción General
Sistema que permite a proveedores seleccionar su categoría al registrarse, y recibir un formulario de servicios específico una vez aprobados por un administrador.

## 🔄 Flujo Completo

### Fase 1: Registro de Proveedor
```
1. Usuario selecciona "Registrarse como Proveedor"
2. Selecciona su categoría (Banquetero, Rentador de Local, etc.)
3. Completa datos básicos (nombre, email, teléfono, etc.)
4. Se crea registro en `provider_requests` con status "pending"
5. Envía confirmación al email
```

### Fase 2: Aprobación por Admin
```
1. Admin ve lista de solicitudes pendientes
2. Puede aprobar o rechazar
3. Si aprueba:
   - Crea usuario en `providers` table
   - Guarda category_id
   - Cambia status a "approved"
4. Si rechaza:
   - Marca como "rejected"
```

### Fase 3: Proveedor Completa Perfil
```
1. Proveedor inicia sesión tras aprobación
2. Sistema detecta su category_id
3. Muestra el formulario de servicios específico:
   - Banquetero: Menú, Capacidad, Servicios gastronómicos
   - Rentador: Ubicación, Precio, Tipo de espacio
4. Completa su perfil completo
```

## 📊 Cambios en Base de Datos

### Nueva Tabla: `categories`
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
)
```

### Nueva Tabla: `provider_requests`
```sql
CREATE TABLE provider_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    category_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID,
    FOREIGN KEY (category_id) REFERENCES categories(id)
)
```

### Actualizar Tabla: `providers`
```sql
ALTER TABLE providers
ADD COLUMN category_id INT,
ADD COLUMN provider_request_id INT,
ADD FOREIGN KEY (category_id) REFERENCES categories(id),
ADD FOREIGN KEY (provider_request_id) REFERENCES provider_requests(id)
```

## 🔗 Endpoints Necesarios

### Backend
- `POST /api/provider-requests` - Crear solicitud de registro
- `GET /api/admin/provider-requests` - Listar pendientes
- `POST /api/admin/provider-requests/:id/approve` - Aprobar
- `POST /api/admin/provider-requests/:id/reject` - Rechazar
- `GET /api/categories` - Listar categorías

### Frontend
- Página de registro con selector de categoría
- Dashboard admin con tabla de solicitudes
- Formularios dinámicos por categoría

## 🎯 Componentes a Crear

1. **ProviderRegistrationForm** - Registro con categoría
2. **AdminProviderRequests** - Dashboard de aprobación
3. **CategorySpecificServiceForm** - Formulario dinámico
4. **BanqueteroServiceForm** - Específico para banquetero
5. **RentadorLocalServiceForm** - Específico para rentador
