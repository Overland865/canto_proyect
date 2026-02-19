# Frontend Local_Space

> **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS + Supabase + Stripe  
> **Deployment**: Vercel  
> **Puerto local**: 4200

---

## 🎯 ¿Qué es Local_Space?

Plataforma web donde **proveedores de servicios para eventos** (locales, catering, fotografía, DJ, etc.) publican sus servicios y **consumidores** los reservan y pagan en línea.

---

## 🚀 Inicio Rápido

```bash
npm install
npm run dev    # → http://localhost:4200
```

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticación y Registro

- **Login/Register** con Supabase Auth (email + contraseña)
- **Verificación por email** con código OTP de 6 dígitos
- **Roles de usuario**: Consumer, Provider, Admin
- **Auth Context** global que maneja sesión, perfil y redirecciones
- **Middleware de Supabase SSR** para protección de rutas
- **Auth Callback** para manejo de redirección post-verificación

### 🏠 Landing Page

- Diseño moderno con gradientes y animaciones
- **Carrusel automático** de categorías (embla-carousel)
- Sección de servicios destacados
- Barra de búsqueda rápida
- Links directos al marketplace y registro
- Responsive para móvil y desktop

### 🛒 Marketplace

- **Listado de servicios** verificados con tarjetas visuales
- **Barra de filtros** avanzada:
  - Por categoría (Local, Catering, Fotografía, DJ, etc.)
  - Por rango de precio (slider)
  - Por ubicación
  - Por calificación
- **Detalle de servicio** (`/marketplace/[id]`):
  - Galería de imágenes
  - Información del proveedor
  - Calendario de disponibilidad
  - **Sistema de reseñas** con promedio y distribución
  - Card de reserva con selector de fecha, hora y número de invitados

### ⭐ Sistema de Reseñas

- **ReviewForm**: Formulario interactivo con estrellas clickeables (1-5) + comentario
- **ReviewsList**: Muestra reseñas con promedio, distribución por estrellas y lista de reviews
- Solo usuarios que completaron una reserva pueden dejar reseña
- Las reseñas se muestran en la página de detalle del servicio

### 💳 Pagos con Stripe

- Integración completa con **Stripe Checkout**
- **Flujo de pago**:
  1. Usuario selecciona servicio y fecha
  2. Se crea sesión de checkout
  3. Redirección a Stripe para pagar
  4. Webhook actualiza estado del pago
- Páginas de **éxito** (`/payment/success`) y **cancelación** (`/payment/cancel`)
- API Route para crear sesiones de checkout

### 👤 Dashboard del Consumidor (`/dashboard/user`)

- **Mis Reservas**: Lista de todas las reservas con estados (pending, confirmed, rejected, rescheduled, completed)
- **Badges de estado** con colores distintivos
- **Aceptar/Rechazar reprogramaciones** propuestas por proveedores
- **Dejar reseña** en reservas completadas (integración con ReviewForm)
- **Mi Perfil** (`/dashboard/user/profile`): Editar nombre y datos personales

### 🏢 Dashboard del Proveedor (`/dashboard/provider`)

- **Panel principal** con estadísticas:
  - Total de reservas
  - Reservas pendientes
  - Ingresos del mes
  - Calificación promedio
- **Mis Servicios** (`/dashboard/provider/services`):
  - Lista de servicios publicados
  - Crear nuevo servicio (`/services/new`) con:
    - Título, descripción, categoría, precio
    - **Galería de imágenes** (subida a Supabase Storage)
    - Ubicación y unidad de precio
  - Editar servicio existente (`/services/[id]`)
- **Reservas** (`/dashboard/provider/bookings`):
  - Ver todas las reservas recibidas
  - **Aceptar** o **rechazar** reservas
  - **Reprogramar** con nueva fecha/hora propuesta
  - Filtrar por estado
- **Mi Perfil** (`/dashboard/provider/profile`):
  - Editar perfil de negocio
  - Logo y galería de imágenes del negocio
  - Teléfono, sitio web, redes sociales
  - Descripción del negocio
- **Mensajes** (`/dashboard/provider/messages`): Sistema de mensajería
- **Calendario de Disponibilidad** (componente `availability-calendar`)

### 🔧 Panel de Administrador (`/dashboard/admin`)

- **Gestión de Proveedores** (`/dashboard/admin/providers`):
  - Lista completa de proveedores con datos
  - Ver servicios de cada proveedor
  - **Verificar/Rechazar** servicios pendientes
  - **Eliminar proveedor** completamente (incluye auth.users, servicios, reservas)
  - Estadísticas generales

### 🧩 Componentes Shared

- **Navbar**: Navegación con menú de usuario, carrito, links por rol
- **Footer**: Información del proyecto, links útiles
- **Cart Sheet**: Panel lateral con carrito de servicios

### 🗂️ Páginas Adicionales

- **Proveedores** (`/providers`): Listado de todos los proveedores
- **Detalle del Proveedor** (`/providers/[id]`): Perfil público con servicios
- **Categorías** (`/category/[slug]`): Servicios filtrados por categoría

---

## 📁 Estructura del Proyecto

```
frontend/src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Layout raíz + providers
│   ├── globals.css                 # Estilos globales
│   ├── (auth)/
│   │   ├── login/page.tsx          # Página de login
│   │   └── register/page.tsx       # Registro con OTP
│   ├── auth/callback/              # Callback de Supabase Auth
│   ├── marketplace/
│   │   ├── page.tsx                # Listado de servicios
│   │   └── [id]/page.tsx           # Detalle + reseñas + reserva
│   ├── providers/
│   │   ├── page.tsx                # Listado de proveedores
│   │   └── [id]/page.tsx           # Perfil público del proveedor
│   ├── category/[slug]/page.tsx    # Servicios por categoría
│   ├── payment/
│   │   ├── success/page.tsx        # Pago exitoso
│   │   └── cancel/page.tsx         # Pago cancelado
│   ├── dashboard/
│   │   ├── user/
│   │   │   ├── page.tsx            # Reservas del usuario + reseñas
│   │   │   └── profile/page.tsx    # Perfil del usuario
│   │   ├── provider/
│   │   │   ├── page.tsx            # Panel principal del proveedor
│   │   │   ├── services/page.tsx   # Mis servicios
│   │   │   ├── services/new/       # Crear servicio
│   │   │   ├── services/[id]/      # Editar servicio
│   │   │   ├── bookings/page.tsx   # Gestión de reservas
│   │   │   ├── profile/page.tsx    # Perfil del negocio
│   │   │   └── messages/page.tsx   # Mensajes
│   │   └── admin/
│   │       └── providers/page.tsx  # Panel de administración
│   └── api/
│       ├── create-checkout-session/  # Stripe checkout
│       ├── webhooks/                 # Stripe webhooks
│       ├── services/                 # API de servicios
│       └── admin/                    # API de admin
├── components/
│   ├── ui/                    # 27 componentes Radix/shadcn
│   ├── shared/
│   │   ├── navbar.tsx         # Barra de navegación
│   │   ├── footer.tsx         # Pie de página
│   │   └── cart-sheet.tsx     # Carrito lateral
│   ├── marketplace/
│   │   ├── filter-bar.tsx     # Filtros del marketplace
│   │   ├── service-booking-card.tsx  # Card de reserva
│   │   └── map-view.tsx       # Vista de mapa
│   ├── reviews/
│   │   ├── ReviewForm.tsx     # Formulario de reseña
│   │   └── ReviewsList.tsx    # Lista de reseñas
│   └── dashboard/
│       └── provider/
│           └── availability-calendar.tsx
├── context/
│   ├── auth-context.tsx       # Autenticación global
│   ├── cart-context.tsx       # Estado del carrito
│   └── provider-context.tsx   # Estado del proveedor
└── lib/
    ├── api.ts                 # Cliente HTTP para el backend
    ├── stripe.ts              # Configuración de Stripe
    ├── data.ts                # Datos estáticos (categorías)
    ├── utils.ts               # Utilidades (cn, etc.)
    └── supabase/
        ├── client.ts          # Cliente Supabase (browser)
        ├── server.ts          # Cliente Supabase (server)
        └── middleware.ts      # Middleware SSR
```

---

## 🛠️ Tecnologías Usadas

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework React con App Router y SSR |
| **React 19** | Interfaz de usuario |
| **TypeScript** | Tipado estático |
| **Tailwind CSS 3** | Estilos y diseño responsive |
| **Supabase** | Auth, Database, Storage |
| **Stripe** | Procesamiento de pagos |
| **Radix UI / shadcn** | 27 componentes de UI accesibles |
| **Lucide React** | Iconografía |
| **Embla Carousel** | Carrusel de la landing |
| **React Hook Form + Zod** | Formularios con validación |
| **date-fns** | Manejo de fechas |
| **Sonner** | Notificaciones toast |
| **next-themes** | Soporte de tema claro/oscuro |

---

## ⚙️ Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.onrender.com
STRIPE_SECRET_KEY=sk_live_...
```

---

## 📝 Scripts

```bash
npm run dev    # Desarrollo en puerto 4200
npm run build  # Build de producción
npm run start  # Producción en puerto 4200
npm run lint   # Linting con ESLint
```
