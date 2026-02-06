# Local_Space Project

Plataforma de servicios locales con arquitectura híbrida y segura.

## 🏗️ Arquitectura del Sistema (Actualizado)

El proyecto sigue una estructura **Monorepo** profesional:

- **📂 `/frontend`**: Aplicación **Next.js** (App Router). Maneja la UI y la experiencia de usuario.
- **📂 `/backend`**: API RESTful con **Express & Node.js**. Maneja la lógica de negocio, validaciones complejas y seguridad.
- **🗄️ Base de Datos**: **Supabase** (PostgreSQL) gestionada externamente pero conectada tanto al frontend (Auth) como al backend (Datos).

### 🚀 Cómo Iniciar el Proyecto

Necesitas correr dos terminales simultáneamente:

**Terminal 1: Frontend** (Puerto 4200)
```bash
npm run dev:frontend
```

**Terminal 2: Backend** (Puerto 3000)
```bash
npm run dev:backend
```

## 📅 Registro de Cambios Recientes

### ✨ Backend Robusto & Seguridad (26/01/26)
- **Separación de Poderes**: Migración completa a arquitectura Backend/Frontend separada.
- **Middleware de Seguridad**: Implementación de verificación de JWT de Supabase en el backend.
- **Validación Inteligente**: El backend ahora previene duplicados y valida precios lógicos antes de crear servicios.
- **Vinculación Automática**: Los servicios se ligan automáticamente al usuario autenticado (sin confiar en el frontend).

### 🔧 Infraestructura Anterior
- **Tailwind CSS v3.5**: Estable para evitar conflictos.
- **OTP Auth**: Verificación por código de 6 dígitos.
- **Base de Datos**: Esquemas `profiles`, `services`, `bookings` desplegados.
