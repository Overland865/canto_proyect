# 🔐 Implementación de Admin General - Backend Local_Space

## 📋 Resumen
Este documento contiene todas las instrucciones y código necesario para implementar el rol de **Administrador General** en el backend de Local_Space.

---

## 🎯 Objetivos

1. ✅ Agregar soporte para el rol `admin` en la base de datos
2. ✅ Crear middleware de autenticación y autorización
3. ✅ Implementar rutas protegidas para administradores
4. ✅ Crear controladores para gestión de proveedores

---

## 📦 Paso 1: Actualizar Base de Datos (Supabase)

### 1.1 Ejecutar Script SQL

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta el siguiente script:

```sql
-- =====================================================
-- SCRIPT: Configuración de Rol de Administrador General
-- =====================================================

-- 1. Modificar la tabla profiles para soportar el rol 'admin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('consumer', 'provider', 'admin'));

-- 2. Crear función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Políticas RLS para admins
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all provider profiles"
  ON provider_profiles FOR SELECT TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all services"
  ON services FOR SELECT TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Comentarios
COMMENT ON FUNCTION is_admin IS 'Verifica si un usuario tiene rol de administrador';
COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 'Roles permitidos: consumer, provider, admin';
```

### 1.2 Crear Usuario Administrador

Después de ejecutar el script, convierte un usuario existente en admin:

```sql
-- Reemplaza 'tu-email@ejemplo.com' con el email del usuario que será admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu-email@ejemplo.com';

-- Verificar que se creó correctamente
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'admin';
```

---

## 🛠️ Paso 2: Crear Middleware de Autenticación

### 2.1 Crear archivo `src/middleware/auth.js`

```javascript
const supabase = require('../config/supabase');

/**
 * Middleware para verificar que el usuario esté autenticado
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Token inválido o expirado' 
      });
    }

    // Obtener el perfil del usuario con su rol
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ 
        error: 'Perfil no encontrado',
        message: 'El usuario no tiene un perfil asociado' 
      });
    }

    // Agregar usuario y perfil al request
    req.user = user;
    req.profile = profile;
    
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(500).json({ 
      error: 'Error de autenticación',
      message: 'Error al verificar la autenticación' 
    });
  }
};

/**
 * Middleware para verificar que el usuario sea un administrador
 */
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.profile) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Debe estar autenticado para acceder a esta ruta' 
      });
    }

    if (req.profile.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'Se requiere rol de administrador para acceder a este recurso' 
      });
    }

    next();
  } catch (error) {
    console.error('Error en adminMiddleware:', error);
    res.status(500).json({ 
      error: 'Error de autorización',
      message: 'Error al verificar permisos de administrador' 
    });
  }
};

/**
 * Middleware para verificar que el usuario sea un proveedor
 */
const providerMiddleware = async (req, res, next) => {
  try {
    if (!req.profile) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Debe estar autenticado para acceder a esta ruta' 
      });
    }

    if (req.profile.role !== 'provider' && req.profile.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'Se requiere rol de proveedor para acceder a este recurso' 
      });
    }

    next();
  } catch (error) {
    console.error('Error en providerMiddleware:', error);
    res.status(500).json({ 
      error: 'Error de autorización',
      message: 'Error al verificar permisos de proveedor' 
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  providerMiddleware
};
```

---

## 📝 Paso 3: Crear Controlador de Admin

### 3.1 Actualizar `src/controllers/admin.controller.js`

Agregar las siguientes funciones al controlador existente:

```javascript
const supabase = require('../config/supabase');

// ========================================
// GESTIÓN DE PROVEEDORES (ADMIN)
// ========================================

/**
 * Obtener todos los proveedores registrados
 * Solo accesible para administradores
 */
const getAllProviders = async (req, res, next) => {
  try {
    // Obtener todos los perfiles con rol 'provider'
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Obtener detalles de negocio de los proveedores
    const { data: providerDetails, error: detailsError } = await supabase
      .from('provider_profiles')
      .select('*');

    if (detailsError) {
      console.warn('Error al obtener provider_profiles:', detailsError);
    }

    // Mapear nombres de negocio a los perfiles
    const businessMap = new Map();
    if (providerDetails) {
      providerDetails.forEach((detail) => {
        businessMap.set(detail.id, {
          businessName: detail.business_name,
          phone: detail.phone,
          address: detail.address,
          description: detail.description
        });
      });
    }

    // Combinar datos
    const providers = profiles.map((profile) => ({
      ...profile,
      businessInfo: businessMap.get(profile.id) || null
    }));

    res.json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de proveedores
 */
const getProviderStats = async (req, res, next) => {
  try {
    // Total de proveedores
    const { count: totalProviders, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'provider');

    if (countError) throw countError;

    // Proveedores con servicios verificados
    const { data: verifiedProviders, error: verifiedError } = await supabase
      .from('services')
      .select('provider_id')
      .eq('is_verified', true);

    if (verifiedError) throw verifiedError;

    const uniqueVerifiedProviders = new Set(
      verifiedProviders.map(s => s.provider_id)
    ).size;

    // Servicios pendientes de verificación
    const { count: pendingServices, error: pendingError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false);

    if (pendingError) throw pendingError;

    res.json({
      success: true,
      data: {
        totalProviders: totalProviders || 0,
        providersWithVerifiedServices: uniqueVerifiedProviders,
        pendingServices: pendingServices || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener servicios de un proveedor específico
 */
const getProviderServices = async (req, res, next) => {
  try {
    const { providerId } = req.params;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
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

// ========================================
// FUNCIONES EXISTENTES (mantener)
// ========================================

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
  // Funciones existentes
  verifyService,
  getPendingServices,
  rejectService,
  // Nuevas funciones para admin
  getAllProviders,
  getProviderStats,
  getProviderServices
};
```

---

## 🛣️ Paso 4: Actualizar Rutas de Admin

### 4.1 Actualizar `src/routes/admin.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { 
  verifyService, 
  getPendingServices, 
  rejectService,
  getAllProviders,
  getProviderStats,
  getProviderServices
} = require('../controllers/admin.controller');
const { validateVerifyService } = require('../middleware/validation');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ========================================
// APLICAR MIDDLEWARE DE AUTENTICACIÓN
// ========================================
// Todas las rutas de admin requieren autenticación y rol de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// ========================================
// RUTAS DE GESTIÓN DE SERVICIOS
// ========================================

// GET /admin/servicios-pendientes - Obtener servicios pendientes
router.get('/servicios-pendientes', getPendingServices);

// PATCH /admin/verificar-servicio/:id - Verificar servicio
router.patch('/verificar-servicio/:id', validateVerifyService, verifyService);

// DELETE /admin/rechazar-servicio/:id - Rechazar servicio
router.delete('/rechazar-servicio/:id', validateVerifyService, rejectService);

// ========================================
// RUTAS DE GESTIÓN DE PROVEEDORES (NUEVO)
// ========================================

// GET /admin/proveedores - Obtener todos los proveedores
router.get('/proveedores', getAllProviders);

// GET /admin/estadisticas - Obtener estadísticas generales
router.get('/estadisticas', getProviderStats);

// GET /admin/proveedores/:providerId/servicios - Obtener servicios de un proveedor
router.get('/proveedores/:providerId/servicios', getProviderServices);

module.exports = router;
```

---

## 🧪 Paso 5: Probar las Rutas

### 5.1 Obtener Token de Autenticación

Primero, inicia sesión desde el frontend y copia el token de acceso. O usa Thunder Client/Postman:

```javascript
// En el frontend, después de login:
const { data: { session } } = await supabase.auth.getSession();
console.log('Access Token:', session.access_token);
```

### 5.2 Pruebas con Thunder Client / Postman

#### ✅ Prueba 1: Obtener todos los proveedores

```
Método: GET
URL: http://localhost:3000/admin/proveedores
Headers:
  Authorization: Bearer TU_TOKEN_AQUI
  
Respuesta esperada:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid-here",
      "email": "proveedor@ejemplo.com",
      "full_name": "Juan Pérez",
      "role": "provider",
      "created_at": "2026-01-30T...",
      "businessInfo": {
        "businessName": "Salón Los Pinos",
        "phone": "555-1234",
        "address": "Calle Principal 123",
        "description": "Salón de eventos"
      }
    }
  ]
}
```

#### ✅ Prueba 2: Obtener estadísticas

```
Método: GET
URL: http://localhost:3000/admin/estadisticas
Headers:
  Authorization: Bearer TU_TOKEN_AQUI
  
Respuesta esperada:
{
  "success": true,
  "data": {
    "totalProviders": 10,
    "providersWithVerifiedServices": 7,
    "pendingServices": 3
  }
}
```

#### ✅ Prueba 3: Obtener servicios de un proveedor

```
Método: GET
URL: http://localhost:3000/admin/proveedores/{PROVIDER_ID}/servicios
Headers:
  Authorization: Bearer TU_TOKEN_AQUI
  
Respuesta esperada:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Salón Principal",
      "category": "Locales",
      "price": 5000,
      "is_verified": true
    }
  ]
}
```

---

## 📋 Checklist de Implementación

- [ ] **Paso 1**: Ejecutar script SQL en Supabase
- [ ] **Paso 2**: Crear usuario administrador en la base de datos
- [ ] **Paso 3**: Crear archivo `src/middleware/auth.js`
- [ ] **Paso 4**: Actualizar `src/controllers/admin.controller.js`
- [ ] **Paso 5**: Actualizar `src/routes/admin.routes.js`
- [ ] **Paso 6**: Reiniciar el servidor backend
- [ ] **Paso 7**: Probar rutas con Thunder Client
- [ ] **Paso 8**: Verificar que solo usuarios con rol 'admin' puedan acceder

---

## 🔒 Seguridad

### Puntos Importantes:

1. ✅ **Autenticación requerida**: Todas las rutas de admin requieren token válido
2. ✅ **Verificación de rol**: Solo usuarios con `role = 'admin'` pueden acceder
3. ✅ **RLS en Supabase**: Políticas de seguridad a nivel de base de datos
4. ✅ **Tokens JWT**: Verificados directamente con Supabase
5. ✅ **Error handling**: Mensajes de error apropiados sin exponer información sensible

---

## 📞 Soporte

Si encuentras algún error durante la implementación:

1. Verifica que el script SQL se ejecutó correctamente
2. Confirma que el usuario tiene rol 'admin' en la base de datos
3. Revisa que el token de autenticación sea válido
4. Verifica los logs del servidor para errores específicos

---

**Fecha de creación**: 2026-01-30  
**Versión**: 1.0  
**Autores**: Equipo Local_Space
