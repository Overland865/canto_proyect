# Plan Maestro de Implementación Web (Modo Producción)

Este plan está adaptado para un entorno **YA DESPLEGADO** (Vercel + Render).
Todos los cambios se hacen pensando en CI/CD: "Push to Main -> Deploy Automático".

---

## FASE 0: MIGRACIÓN DE DATOS (PRODUCCIÓN)
**Estado**: Crítico.
**Acción**:
1.  Ir al Dashboard de Supabase (Producción).
2.  Abrir SQL Editor.
3.  Ejecutar el contenido de `MIGRATION_TO_MASTER.sql`.
    *   *Esto alineará los roles antiguos (cliente/proveedor) con los nuevos (consumer/provider) sin borrar usuarios.*

## FASE 1: AUTHENTICATION (NEXT.JS)
**Objetivo**: Asegurar que Login y Registro funcionen con los nuevos roles.

- [ ] **1. Verificar `types_db.ts` (Supabase Types)**:
    - Si usas tipos generados, actualizarlos. Si no, asegurar que el código no use strings hardcodeados antiguos ('cliente').
- [ ] **2. Actualizar `./src/app/(auth)/login/page.tsx`**:
    - Cambiar lógica de redirección:
        - `role === 'admin'` -> `/dashboard/admin`
        - `role === 'provider'` -> `/dashboard/provider`
        - `role === 'consumer'` -> `/marketplace`
- [ ] **3. Actualizar `./src/app/(auth)/register/page.tsx`**:
    - Asegurar que al registrarse se use el endpoint/función correcta que asigna el role 'consumer' por defecto o 'provider' (con status pending).

## FASE 2: GUEST & LANDING (SEO)
**Objetivo**: Mejorar la conversión en Vercel.

- [ ] **1. Landing Page**:
    - Revisar `page.tsx` (Home). Asegurar que los enlaces lleven a `/marketplace` o `/auth/register`.
- [ ] **2. Variables de Entorno (Vercel)**:
    - Verificar en Vercel Dashboard que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas.

## FASE 3: MARKETPLACE & BOOKING
**Objetivo**: Permitir compras reales.

- [ ] **1. Listado de Servicios**:
    - Actualizar Query: `select *, provider:provider_profiles!inner(business_name)`
    - Filtrar: `provider_profiles.status = 'approved'`.
- [ ] **2. Checkout**:
    - Implementar llamada a RPC `create_booking`.
    - **IMPORTANTE**: No subir claves de Stripe ni lógicas de pago al cliente. Usar el backend seguro.

## FASE 4: DASHBOARD PROVEEDOR
**Objetivo**: Que los proveedores gestionen sus servicios.

- [ ] **1. Protección de Rutas**:
    - Crear `middleware.ts` en Next.js (o actualizarlo) para proteger `/dashboard/provider/*` solo para usuarios con `role: provider`.

---
**PASO INMEDIATO PARA TI (USUARIO):**
1.  Copia el código de `MIGRATION_TO_MASTER.sql`.
2.  Ejecútalo en tu Supabase SQL Editor.
3.  Avísame cuando esté listo para empezar a editar el Login (Fase 1).
