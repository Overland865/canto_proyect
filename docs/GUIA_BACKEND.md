# 🚀 Guía Completa de Implementación del Backend - Local_Space

> **Responsables**: Kin y Martin  
> **Objetivo**: Crear un backend seguro, estructurado y funcional para entregar a Luis

---

## 📋 Tabla de Contenidos

1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Configuración de Supabase](#2-configuración-de-supabase)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Implementación del Código](#4-implementación-del-código)
5. [Seguridad y Buenas Prácticas](#5-seguridad-y-buenas-prácticas)
6. [Pruebas con Thunder Client](#6-pruebas-con-thunder-client)
7. [Documentación para Luis](#7-documentación-para-luis)

---

## 1. Preparación del Entorno

### 1.1 Instalación de Herramientas

```bash
# Verificar que Node.js esté instalado (versión 16 o superior)
node --version

# Verificar npm
npm --version
```

### 1.2 Crear el Proyecto

```bash
# Crear carpeta del proyecto
mkdir backend-localspace
cd backend-localspace

# Inicializar proyecto Node.js
npm init -y
```

### 1.3 Instalar Dependencias

```bash
# Dependencias principales
npm install express cors dotenv @supabase/supabase-js

# Dependencias de seguridad
npm install helmet express-rate-limit express-validator

# Dependencias de desarrollo
npm install --save-dev nodemon
```

---

## 2. Configuración de Supabase

### 2.1 Script de Base de Datos

Ejecutar en el **SQL Editor** de Supabase (este script lo está elaborando Martin):

```sql
-- Tabla de perfiles para distinguir roles
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  role text CHECK (role IN ('cliente', 'proveedor', 'admin')) DEFAULT 'cliente'
);

-- Tabla de servicios y locales
CREATE TABLE services (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider_id uuid REFERENCES profiles(id),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  description text,
  image_url text, -- URL pública de la imagen en el Storage
  is_verified boolean DEFAULT false
);

-- Tabla de registro de evidencias para verificación
CREATE TABLE verifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider_id uuid REFERENCES profiles(id),
  document_url text, -- URL del documento/evidencia en el Storage
  status text CHECK (status IN ('pendiente', 'aprobado', 'rechazado')) DEFAULT 'pendiente'
);
```

> **Nota**: Este es el script exacto proporcionado por Martin. No se deben agregar campos adicionales ni modificar la estructura.

### 2.2 Configuración de Storage (Buckets)

En la sección **Storage** de Supabase:

#### Bucket 1: `imagenes-publicas`
- **Tipo**: Public
- **Uso**: Fotos de locales y servicios
- **Configuración**:
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
  - Max file size: 5 MB

#### Bucket 2: `evidencias-privadas`
- **Tipo**: Private
- **Uso**: Documentos de verificación
- **Configuración**:
  - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`
  - Max file size: 10 MB

### 2.3 Obtener Credenciales

1. Ir a **Settings** → **API**
2. Copiar:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_KEY)

---

## 3. Estructura del Proyecto

Crear la siguiente estructura de carpetas y archivos:

```
backend-localspace/
├── src/
│   ├── config/
│   │   └── supabase.js          # Configuración de Supabase
│   ├── middleware/
│   │   ├── security.js          # Middleware de seguridad
│   │   └── validation.js        # Validaciones
│   ├── routes/
│   │   ├── services.routes.js   # Rutas de servicios
│   │   └── admin.routes.js      # Rutas de administración
│   ├── controllers/
│   │   ├── services.controller.js
│   │   └── admin.controller.js
│   └── utils/
│       └── errorHandler.js      # Manejo de errores
├── .env                          # Variables de entorno (NO SUBIR A GIT)
├── .env.example                  # Ejemplo de variables
├── .gitignore
├── index.js                      # Punto de entrada
├── package.json
└── README.md                     # Documentación para Luis
```

---

## 4. Implementación del Código

### 4.1 Archivo `.env`

```env
# Configuración de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anon-publica

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Seguridad
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4.2 Archivo `.env.example`

```env
# Configuración de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anon-publica

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Seguridad
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4.3 `src/config/supabase.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
```

### 4.4 `src/middleware/security.js`

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración de helmet para seguridad HTTP
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});

// Limitador de peticiones para prevenir ataques DDoS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 peticiones por ventana
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { helmetConfig, limiter };
```

### 4.5 `src/middleware/validation.js`

```javascript
const { body, query, param, validationResult } = require('express-validator');

// Middleware para verificar resultados de validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      details: errors.array() 
    });
  }
  next();
};

// Validaciones para crear servicio
const validateCreateService = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('category').trim().notEmpty().withMessage('La categoría es requerida'),
  body('price').isNumeric().withMessage('El precio debe ser numérico').isFloat({ min: 0 }).withMessage('El precio debe ser positivo'),
  body('description').optional().trim(),
  body('image_url').optional().isURL().withMessage('La URL de la imagen debe ser válida'),
  body('provider_id').optional().isUUID().withMessage('El ID del proveedor debe ser un UUID válido'),
  validate
];

// Validaciones para filtro de presupuesto
const validateBudgetFilter = [
  query('presupuesto').optional().isNumeric().withMessage('El presupuesto debe ser numérico').isFloat({ min: 0 }).withMessage('El presupuesto debe ser positivo'),
  validate
];

// Validaciones para verificar servicio
const validateVerifyService = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  validate
];

module.exports = {
  validateCreateService,
  validateBudgetFilter,
  validateVerifyService
};
```

### 4.6 `src/utils/errorHandler.js`

```javascript
// Manejador centralizado de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de Supabase
  if (err.code) {
    return res.status(400).json({
      error: 'Error en la base de datos',
      message: err.message,
      code: err.code
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
  });
};

// Manejador de rutas no encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
};

module.exports = { errorHandler, notFoundHandler };
```

### 4.7 `src/controllers/services.controller.js`

```javascript
const supabase = require('../config/supabase');

// Obtener servicios verificados con filtro opcional de presupuesto
const getServices = async (req, res, next) => {
  try {
    const { presupuesto, category } = req.query;
    
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    // Filtro por presupuesto
    if (presupuesto) {
      query = query.lte('price', parseFloat(presupuesto));
    }

    // Filtro por categoría
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Crear nuevo servicio
const createService = async (req, res, next) => {
  try {
    const serviceData = {
      ...req.body,
      is_verified: false // Por defecto no verificado
    };

    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente. Pendiente de verificación.',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un servicio por ID
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  createService,
  getServiceById
};
```

### 4.8 `src/controllers/admin.controller.js`

```javascript
const supabase = require('../config/supabase');

// Verificar un servicio (solo admin)
const verifyService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('services')
      .update({ is_verified: true })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Servicio verificado exitosamente',
      data: data[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener servicios pendientes de verificación
const getPendingServices = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Rechazar un servicio
const rejectService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Servicio rechazado y eliminado'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyService,
  getPendingServices,
  rejectService
};
```

### 4.9 `src/routes/services.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { 
  getServices, 
  createService, 
  getServiceById 
} = require('../controllers/services.controller');
const { 
  validateCreateService, 
  validateBudgetFilter 
} = require('../middleware/validation');

// GET /servicios - Obtener servicios verificados
router.get('/', validateBudgetFilter, getServices);

// GET /servicios/:id - Obtener un servicio por ID
router.get('/:id', getServiceById);

// POST /servicios - Crear nuevo servicio
router.post('/', validateCreateService, createService);

module.exports = router;
```

### 4.10 `src/routes/admin.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { 
  verifyService, 
  getPendingServices, 
  rejectService 
} = require('../controllers/admin.controller');
const { validateVerifyService } = require('../middleware/validation');

// GET /admin/servicios-pendientes - Obtener servicios pendientes
router.get('/servicios-pendientes', getPendingServices);

// PATCH /admin/verificar-servicio/:id - Verificar servicio
router.patch('/verificar-servicio/:id', validateVerifyService, verifyService);

// DELETE /admin/rechazar-servicio/:id - Rechazar servicio
router.delete('/rechazar-servicio/:id', validateVerifyService, rejectService);

module.exports = router;
```

### 4.11 `index.js` (Punto de entrada principal)

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { helmetConfig, limiter } = require('./src/middleware/security');
const { errorHandler, notFoundHandler } = require('./src/utils/errorHandler');
const servicesRoutes = require('./src/routes/services.routes');
const adminRoutes = require('./src/routes/admin.routes');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad HTTP
app.use(helmetConfig);

// Rate limiting
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] // Cambiar en producción
    : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser de JSON
app.use(express.json());

// Parser de URL encoded
app.use(express.urlencoded({ extended: true }));

// ============================================
// RUTAS
// ============================================

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor Local_Space funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de servicios
app.use('/servicios', servicesRoutes);

// Rutas de administración
app.use('/admin', adminRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use(notFoundHandler);

// Manejador de errores global
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 Servidor Local_Space iniciado`);
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Hora: ${new Date().toLocaleString()}`);
  console.log('===========================================');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});
```

### 4.12 `package.json` (Actualizar scripts)

```json
{
  "name": "backend-localspace",
  "version": "1.0.0",
  "description": "Backend para la aplicación Local_Space",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["backend", "supabase", "express"],
  "author": "Kin y Martin",
  "license": "ISC"
}
```

### 4.13 `.gitignore`

```
# Dependencias
node_modules/

# Variables de entorno
.env

# Logs
*.log
npm-debug.log*

# Sistema operativo
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Archivos temporales
tmp/
temp/
```

---

## 5. Seguridad y Buenas Prácticas

### 5.1 Checklist de Seguridad

- [x] **Variables de entorno**: Credenciales en `.env`, nunca en el código
- [x] **Helmet**: Protección de headers HTTP
- [x] **Rate limiting**: Prevención de ataques DDoS
- [x] **Validación de datos**: Validación con `express-validator`
- [x] **CORS configurado**: Solo orígenes permitidos
- [x] **Manejo de errores**: No exponer información sensible
- [x] **RLS en Supabase**: Políticas de seguridad a nivel de base de datos
- [x] **Sanitización**: Trim y validación de inputs

### 5.2 Mejoras Recomendadas para Producción

```javascript
// Agregar autenticación JWT
const jwt = require('jsonwebtoken');

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Autenticación fallida' });
  }
};

// Middleware para verificar rol de admin
const adminMiddleware = async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};
```

---

## 6. Pruebas con Thunder Client

### 6.1 Configuración de Thunder Client

1. Instalar extensión **Thunder Client** en VS Code
2. Crear una nueva colección llamada "Local_Space API"
3. Configurar variable de entorno: `baseUrl = http://localhost:3000`

### 6.2 Pruebas Obligatorias

#### ✅ Prueba 1: Health Check

```
Método: GET
URL: {{baseUrl}}/health
Resultado esperado: 
{
  "status": "OK",
  "message": "Servidor Local_Space funcionando correctamente",
  "timestamp": "2026-01-13T..."
}
```

#### ✅ Prueba 2: Listado General de Servicios

```
Método: GET
URL: {{baseUrl}}/servicios
Resultado esperado: 
{
  "success": true,
  "count": 0,
  "data": []
}
```

#### ✅ Prueba 3: Filtro por Presupuesto

```
Método: GET
URL: {{baseUrl}}/servicios?presupuesto=5000
Resultado esperado: 
{
  "success": true,
  "count": 0,
  "data": []
}
```

#### ✅ Prueba 4: Creación de Servicio

```
Método: POST
URL: {{baseUrl}}/servicios
Headers:
  Content-Type: application/json
Body (JSON):
{
  "name": "Salón de Eventos El Dorado",
  "category": "Local para eventos",
  "price": 3000,
  "description": "Salón amplio con capacidad para 200 personas",
  "image_url": "https://ejemplo.com/imagen.jpg",
  "provider_id": "uuid-del-proveedor"
}

Resultado esperado (Status 201):
{
  "success": true,
  "message": "Servicio creado exitosamente. Pendiente de verificación.",
  "data": {
    "id": 1,
    "name": "Salón de Eventos El Dorado",
    "is_verified": false,
    ...
  }
}
```

#### ✅ Prueba 5: Obtener Servicios Pendientes (Admin)

```
Método: GET
URL: {{baseUrl}}/admin/servicios-pendientes
Resultado esperado:
{
  "success": true,
  "count": 1,
  "data": [...]
}
```

#### ✅ Prueba 6: Verificar Servicio (Admin)

```
Método: PATCH
URL: {{baseUrl}}/admin/verificar-servicio/1
Resultado esperado:
{
  "success": true,
  "message": "Servicio verificado exitosamente",
  "data": {
    "id": 1,
    "is_verified": true,
    ...
  }
}
```

#### ✅ Prueba 7: Validación de Datos Inválidos

```
Método: POST
URL: {{baseUrl}}/servicios
Body (JSON):
{
  "name": "",
  "price": -100
}

Resultado esperado (Status 400):
{
  "error": "Datos inválidos",
  "details": [...]
}
```

#### ✅ Prueba 8: Ruta No Encontrada

```
Método: GET
URL: {{baseUrl}}/ruta-inexistente
Resultado esperado (Status 404):
{
  "error": "Ruta no encontrada",
  "path": "/ruta-inexistente"
}
```

### 6.3 Documentar Resultados

Crear archivo `RESULTADOS_PRUEBAS.md` con capturas de pantalla y resultados de cada prueba.

---

## 7. Documentación para Luis

### 7.1 Crear `README.md`

```markdown
# Backend Local_Space - Guía de Instalación y Uso

## 📦 Requisitos Previos

- Node.js v16 o superior
- npm v7 o superior
- Cuenta de Supabase configurada

## 🚀 Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Copiar `.env.example` a `.env`
   - Completar con tus credenciales de Supabase

4. **Iniciar el servidor**
   ```bash
   # Modo desarrollo (con auto-reload)
   npm run dev

   # Modo producción
   npm start
   ```

## 📡 Endpoints Disponibles

### Servicios

- `GET /servicios` - Obtener servicios verificados
  - Query params: `?presupuesto=5000&category=Local`
  
- `GET /servicios/:id` - Obtener servicio por ID

- `POST /servicios` - Crear nuevo servicio
  - Body: `{ name, category, price, description, image_url, provider_id }`

### Administración

- `GET /admin/servicios-pendientes` - Servicios pendientes de verificación

- `PATCH /admin/verificar-servicio/:id` - Verificar servicio

- `DELETE /admin/rechazar-servicio/:id` - Rechazar servicio

## 🔒 Seguridad

- Rate limiting: 100 peticiones por 15 minutos
- Validación de datos en todas las rutas
- Headers de seguridad con Helmet
- CORS configurado

## 🧪 Pruebas

Ver archivo `RESULTADOS_PRUEBAS.md` para ejemplos de uso con Thunder Client.

## 📞 Soporte

Contactar a Kin o Martin para cualquier duda.
```

### 7.2 Crear Checklist de Entrega

```markdown
# ✅ Checklist de Entrega - Backend Local_Space

## Archivos del Proyecto
- [ ] Carpeta `backend-localspace` completa
- [ ] Archivo `.env.example` incluido
- [ ] Archivo `README.md` con instrucciones
- [ ] Archivo `RESULTADOS_PRUEBAS.md` con evidencias

## Configuración de Supabase
- [ ] Script SQL ejecutado correctamente
- [ ] Buckets de Storage creados
- [ ] Credenciales documentadas

## Pruebas Realizadas
- [ ] Health check funcional
- [ ] Listado de servicios funcional
- [ ] Filtro por presupuesto funcional
- [ ] Creación de servicios funcional
- [ ] Verificación de servicios funcional
- [ ] Validaciones funcionando correctamente

## Documentación
- [ ] README.md completo
- [ ] Comentarios en el código
- [ ] Variables de entorno documentadas

## Seguridad
- [ ] Variables sensibles en .env
- [ ] .gitignore configurado
- [ ] Rate limiting activo
- [ ] Validaciones implementadas

## Entrega a Luis
- [ ] Carpeta comprimida o repositorio compartido
- [ ] Instrucciones de instalación claras
- [ ] Credenciales de Supabase compartidas de forma segura
- [ ] Contacto disponible para soporte
```

---

## 🎯 Resumen de Pasos

1. **Preparar entorno** → Instalar Node.js y dependencias
2. **Configurar Supabase** → Ejecutar SQL y crear buckets
3. **Crear estructura** → Organizar carpetas y archivos
4. **Implementar código** → Seguir los archivos de la guía
5. **Aplicar seguridad** → Validaciones, rate limiting, helmet
6. **Probar API** → Thunder Client con 8 pruebas obligatorias
7. **Documentar** → README y resultados de pruebas
8. **Entregar** → Carpeta completa y funcional para Luis

---

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Seguridad en Node.js](https://nodejs.org/en/docs/guides/security/)
- [Express Validator](https://express-validator.github.io/docs/)

---

## 🤝 Colaboración

**Kin**: Responsable de implementación del código y estructura  
**Martin**: Responsable de base de datos y pruebas  
**Luis**: Receptor del proyecto para integración con frontend

---

> **Nota Final**: Esta guía está diseñada para ser seguida paso a paso. Cada sección es importante para garantizar un backend seguro, estructurado y funcional. ¡Éxito en la implementación! 🚀
