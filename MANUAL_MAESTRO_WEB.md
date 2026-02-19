# (Manual Maestro Unificado Web & Móvil)

Este documento representa la **fuente de verdad absoluta** para el desarrollo y finalización de la plataforma **LocalSpace**. Fusiona los requerimientos funcionales del "Blueprint Maestro" con la implementación técnica probada en la versión móvil, sirviendo como guía definitiva para completar la versión Web con paridad total de funcionalidades.

---

# PARTE 1: ARQUITECTURA GLOBAL Y TECNOLOGÍA

## 1.1 Stack Tecnológico Unificado
El ecosistema LocalSpace comparte un backend común pero tiene dos frontends distintos que deben funcionar en perfecta sincronía.

| Capa | Tecnología | Detalle |
| :--- | :--- | :--- |
| **Backend** | **Supabase** | PostgreSQL, Auth, Storage, Edge Functions. (Compartido) |
| **Frontend Web** | **Next.js (React)** | Tailwind CSS, Shadcn/UI, Lucide Icons. |
| **Frontend Móvil** | **Flutter (Dart)** | Shadcn UI (Flutter port), Riverpod, GoRouter. |
| **Mapas** | **Integración Nativa** | Google Maps / Mapbox (según plataforma). |

## 1.2 Roles de Usuario (Global)
El sistema se rige estrictamente por el campo `role` en la tabla `profiles`.
1.  **Guest (Invitado)**: Solo visualización (Landing, Catálogo limitado).
2.  **User (Cliente)**: Compra y reserva.
3.  **Provider (Proveedor)**: Vende y gestiona servicios.
4.  **Admin (Administrador)**: Control total y aprobación de proveedores.

---

# PARTE 2: ESPECIFICACIONES FUNCIONALES (NÚCLEO)

Esta sección define *qué* debe hacer la web, basándose en la lógica ya validada en móvil. La Web tiene la capacidad única de servir tanto a Clientes como a Proveedores en una misma interfaz responsive.

## 2.1 Módulo Público (Guest)
**Objetivo**: Convertir visitantes en registrados.

*   **Landing Page (Home)**:
    *   **Hero Section**: Carrusel visual + Buscador principal.
    *   **Explorador Visual**: Grid de categorías con **colores distintivos** (mismos que en móvil):
        *   Locales (Rosa), Banquetes (Naranja), Música (Azul), Foto (Púrpura), etc.
    *   **Propuestas de Valor**: Seguridad, Presupuesto, Calidad.
    *   **CTA Dual**: Invitación a usuarios ("Explora") y a proveedores ("Vende con nosotros").

*   **Registro Unificado**:
    *   **Login**: Email/Password -> Redirección inteligente (`/dashboard` vs `/admin`).
    *   **Registro User**: Simple (Email + Password + Nombre).
    *   **Registro Provider**: Extendido (Nombre Negocio + Categoría + Teléfono).
        *   **CRÍTICO**: El proveedor nace con estado `pending`. No sale en búsquedas hasta aprobación Admin.

## 2.2 Módulo Cliente (User)
**Objetivo**: Experiencia de compra sin fricción.

*   **Marketplace (Catálogo)**:
    *   Filtros obligatorios: Categoría, Precio, Ubicación, Rating.
    *   **Cards**: Imagen, Título, "Desde $PRECIO", Avatar del Proveedor.

*   **Detalle de Servicio**:
    *   Galería completa.
    *   **Badge de Confianza**: Mostrar "Negocio Verificado" (azul) si el proveedor está `approved`.
    *   **Widget de Contacto**: Botón directa a **WhatsApp**.
        *   *Lógica Web*: Abrir `wa.me/52XXXXXXXXXX` (Auto-prenfijo +52 si es necesario).
    *   **Widget de Reserva (Add to Cart)**:
        *   **Selector de Fecha**: Debe consultar `provider_availability` y bloquear días visualmente.

*   **Checkout (Solicitud)**:
    *   No cobra al instante. Crea un `booking` en estado `pending`.
    *   Notifica al proveedor (Email/System).

## 2.3 Módulo Proveedor (Provider)
**Objetivo**: Gestión completa del negocio (Paridad total con móvil).

*   **Dashboard**:
    *   **KPIs**: Ingresos, Reservas Nuevas, Total Bookings.
    *   **Gráfica**: Ingresos últimos 7 días.

*   **Calendario de Disponibilidad (Core Feature)**:
    *   Debe permitir al proveedor hacer clic en un día para **Bloquear/Desbloquear** (`provider_availability`).
    *   Debe mostrar visualmente días con eventos confirmados (Verde) vs Bloqueos manuales (Rojo/Gris).

*   **Gestión de Reservas**:
    *   Lista de "Solicitudes Pendientes".
    *   Acciones: **Aceptar** (pasa a `confirmed`) o **Rechazar** (pasa a `cancelled`).

*   **Perfil Público**:
    *   Edición de: Logo, Nombre Comercial, Descripción, Redes Sociales.

## 2.4 Módulo Administrador (Admin)
**Objetivo**: Control de calidad y seguridad.

*   **Aprobación de Proveedores**:
    *   Lista de `profiles` con rol `provider` y status `pending`.
    *   Botón para "Aprobar" -> Actualiza status a `approved`.
    *   Botón para "Rechazar" -> Desactiva la cuenta.
*   **Métricas Globales**.

---

# PARTE 3: IMPLEMENTACIÓN TÉCNICA (BACKEND MATCHING)

Esta sección detalla la estructura de datos y funciones que la Web **DEBE** utilizar para ser compatible con la App Móvil.

## 3.1 Estructura de Base de Datos (Supabase)

### Tablas Principales
1.  **`profiles`** (Extiende `auth.users`)
    *   `id` (uuid, pk), `email`, `role`, `full_name`, `phone`.
2.  **`provider_profiles`** (Extension Providers)
    *   `id` (uuid, fk profiles), `business_name`, `contact_phone`, `categories`, `status` (`pending`/`approved`, default: `pending`).
3.  **`services`**
    *   `id`, `provider_id`, `title`, `description`, `price`, `category`, `image_url`.
4.  **`bookings`**
    *   `id`, `user_id`, `provider_id`, `service_id`, `date` (timestamp), `status` (`pending`/`confirmed`/`cancelled`), `total_price`.
5.  **`provider_availability`**
    *   `provider_id`, `date` (date/timestamp), `status` (`blocked`).
6.  **`notifications`**
    *   `user_id`, `type`, `title`, `message`, `is_read`.

## 3.2 Lógica de Negocio (Backend Functions / RPC)

La Web debe replicar la siguiente lógica implementada en `SupabaseService` (Móvil):

### A. Autenticación y Redirección
*   Al hacer login, **SIEMPRE** consultar tabla `profiles`.
*   Si `role == 'admin'` -> `/admin/dashboard`.
*   Si `role == 'provider'` -> `/provider/dashboard`.
*   Si `role == 'consumer'` -> `/marketplace` o Home.
*   **Seguridad**: Si el usuario no tiene fila en `profiles`, **BLOQUEAR LOGIN** (Logout inmediato).

### B. Fetch de Servicios (Marketplace)
*   La query debe hacer un `join` con `provider_profiles` para obtener el `business_name` y `contact_phone`.
*   **Filtro Crítico**: Solo mostrar servicios donde `provider_profiles.status == 'approved'`.

### C. Creación de Reservas (Booking)
*   **Input**: Lista de ítems del carrito.
*   **Proceso**:
    1.  Iterar cada servicio.
    2.  Insertar en `bookings` con `status: pending`.
    3.  Insertar en `notifications` para el `provider_id` correspondiente ("Nueva solicitud de reserva").

### D. Gestión de Disponibilidad
*   **Lectura**: Al cargar el `DatePicker` en el detalle del servicio, consultar `provider_availability` + `bookings` (confirmed) para el proveedor.
*   **Escritura**: El proveedor puede hacer upsert/delete en `provider_availability` para bloquear días.

### E. WhatsApp Link Generator
*   **Lógica**:
    1.  Obtener `contact_phone` de `provider_profiles`. Si es null, usar `phone` de `profiles`.
    2.  Limpiar caracteres no numéricos.
    3.  **Regla México**: Si length == 10, pre-pegar `52`.
    4.  Generar link: `https://wa.me/<numero>`.

---

# PARTE 4: DIFERENCIADORES CLAVE (WEB vs MÓVIL)

Aunque comparten lógica, la Web tiene responsabilidades adicionales:

1.  **SEO & Landing**: La Web es la entrada principal de marketing. Debe tener meta-tags, SSR (Server Side Rendering) para los detalles de servicio.
2.  **Gestión Masiva**: El Dashboard de Proveedor en Web puede permitir carga masiva de fotos o edición de textos largos más cómodamente que en móvil.
3.  **Responsividad**:
    *   **Móvil**: Diseño `Stack` / `Column`.
    *   **Web Desktop**: Diseño `Grid` / `Row` / `Sidebar`.
    *   El Dashboard de Admin en Web debe aprovechar el ancho completo para tablas de datos (`DataTable` / `Shadcn Table`).

---

# ANEXO: GUÍA DE ESTILO VISUAL (GLOBAL)

Para mantener la identidad "LocalSpace" consistente entre Next.js y Flutter:

*   **Colores**:
    *   Primary: `Zinc-950` (Oscuro) / `Violet-600` (Acentos).
    *   Warning: `Amber-500` (Pendiente).
    *   Success: `Emerald-600` (Confirmado/Verificado).
    *   Destructive: `Red-600` (Rechazado/Error).
*   **Tipografía**:
    *   Titulares: *Bold / Heavy*.
    *   Cuerpo: *Inter* o *Geist Sans*.
*   **Componentes**:
    *   Usar Shadcn/UI (Web) y Shadcn-Flutter (Móvil) garantiza paridad visual en botones, inputs y tarjetas.

---

**Este documento consolida la visión completa. Cualquier desarrollo futuro en Web debe consultarse contra esta especificación para evitar divergencias con la App Móvil.**
