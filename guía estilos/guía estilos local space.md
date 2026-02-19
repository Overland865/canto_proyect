# 🎨 Guía de Estilos — Local_Space

> **Documento generado:** 2026-02-18  
> **Propósito:** Referencia visual y técnica de todos los estilos del sitio web. Incluye los cambios realizados para el modo de vista previa sin login.

---

## 🔓 Parche: Modo Vista de Estilos (Sin Login)

Se aplicaron **3 cambios** al proyecto para poder navegar todo el sitio sin necesidad de iniciar sesión. Todos están marcados con el comentario `// 🔓 PARCHE MODO VISTA DE ESTILOS`.

### Cambios realizados

| Archivo | Cambio | Propósito |
|---|---|---|
| `src/middleware.ts` | Se comentó `updateSession()` y se reemplazó con `NextResponse.next()` | Deshabilita la protección de rutas por sesión |
| `src/context/auth-context.tsx` | Se agregó flag `STYLE_PREVIEW_MODE = true` + usuario demo | Simula un usuario autenticado sin llamar a Supabase |
| `src/app/page.tsx` | Se eliminó el panel de debug (verde) del hero | Limpia la UI para visualización de estilos |

### Cómo restaurar la autenticación real

Para volver al comportamiento original de producción:

**1. `src/middleware.ts`** — Revertir a:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}
```

**2. `src/context/auth-context.tsx`** — Cambiar el flag a `false`:
```typescript
const STYLE_PREVIEW_MODE = false
```
*(El resto del código de usuario demo es ignorado cuando el flag está en false)*

---

## 🖌️ Sistema de Diseño

### Stack de Estilos
- **Framework CSS:** Tailwind CSS v3
- **Librería de componentes UI:** shadcn/ui (basada en Radix UI)
- **Tipografía:** Geist Sans + Geist Mono (Google Fonts / Vercel)
- **Modo oscuro:** Soportado vía clase `.dark` en el elemento `<html>`
- **Iconos:** `lucide-react`
- **Animaciones:** `tailwindcss-animate` + Embla Carousel (con autoplay)

---

## 🎨 Paleta de Colores (Design Tokens) — v2 (18-Feb-2026)

> **Estilo de referencia:** Navbar azul marino oscuro · Fondo beige/arena cálido · Botones ámbar dorado · Cards blancas

Los colores se definen en `src/app/globals.css` con variables CSS en formato HSL.

### Modo Claro (`:root`) — PALETA ACTIVA

| Token | Valor HSL | Color visual | Uso |
|---|---|---|---|
| `--background` | `38 25% 83%` | 🏜️ Beige/arena cálido | Fondo principal del sitio |
| `--foreground` | `220 55% 18%` | 🌊 Azul marino oscuro | Texto principal |
| `--card` | `0 0% 100%` | ⬜ Blanco puro | Fondo de tarjetas |
| `--card-foreground` | `220 55% 18%` | Azul marino | Texto en tarjetas |
| `--popover` | `0 0% 100%` | Blanco | Fondo de dropdowns |
| `--popover-foreground` | `220 55% 18%` | Azul marino | Texto en dropdowns |
| `--primary` | `32 72% 47%` | 🟠 Ámbar/dorado cálido | Botones CTA, hover links, acciones |
| `--primary-foreground` | `0 0% 100%` | Blanco | Texto sobre ámbar |
| `--secondary` | `38 22% 92%` | Arena muy claro | Fondos sutiles |
| `--secondary-foreground` | `220 55% 18%` | Azul marino | Texto en secundario |
| `--muted` | `38 20% 88%` | Beige apagado | Áreas de baja importancia |
| `--muted-foreground` | `220 25% 45%` | Azul grisáceo | Texto de ayuda, subtextos |
| `--accent` | `32 72% 47%` | 🟠 Ámbar | Acentos, hover states |
| `--accent-foreground` | `0 0% 100%` | Blanco | Texto sobre acento |
| `--destructive` | `0 84.2% 60.2%` | 🔴 Rojo | Acciones destructivas |
| `--border` | `38 18% 72%` | Beige medio | Bordes |
| `--input` | `38 18% 72%` | Beige medio | Bordes de inputs |
| `--ring` | `32 72% 47%` | Ámbar | Focus ring |
| `--navy` | `220 55% 18%` | 🌊 Azul marino | Variable custom para navbar |

### Navbar (hardcoded en componente)

| Elemento | Valor | Nota |
|---|---|---|
| Fondo header | `hsl(220, 55%, 18%)` | Azul marino rico |
| Borde inferior | `hsl(220, 55%, 12%)` | Azul más oscuro |
| Texto base | `text-white` | Blanco puro |
| Links hover | `hover:text-primary` → ámbar | Transición suave |
| Botón Registrarse | `bg-primary` → ámbar | Color de acción |

### Modo Oscuro (`.dark`)

| Token | Valor HSL | Uso |
|---|---|---|
| `--background` | `222.2 84% 4.9%` → Azul marino muy oscuro | Fondo principal |
| `--foreground` | `210 40% 98%` → Blanco | Texto principal |
| `--card` | `222.2 84% 4.9%` → Igual que background | Fondos de tarjetas |
| `--primary` | `217.2 91.2% 59.8%` → Azul brillante (más saturado) | Color primario en oscuro |
| `--primary-foreground` | `222.2 47.4% 11.2%` → Oscuro | Texto sobre primario |
| `--secondary` | `217.2 32.6% 17.5%` → Azul muy oscuro | Fondo secundario |
| `--muted` | `217.2 32.6% 17.5%` → Azul muy oscuro | Áreas apagadas |
| `--muted-foreground` | `215 20.2% 65.1%` → Gris azulado | Texto secundario |
| `--destructive` | `0 62.8% 30.6%` → Rojo oscuro | Acciones destructivas |
| `--border` | `217.2 32.6% 17.5%` → Azul muy oscuro | Bordes |
| `--ring` | `224.3 76.3% 48%` → Azul medio | Focus ring |

### Colores de Categorías (hardcoded en page.tsx)

| Categoría | Clase Tailwind | Color visual |
|---|---|---|
| Locales y Salones | `text-pink-500` | Rosa |
| Banquetes | `text-orange-500` | Naranja |
| Música y Shows | `text-blue-500` | Azul |
| Foto y Video | `text-purple-500` | Púrpura |
| Inflables | `text-yellow-500` | Amarillo |
| Barra Libre | `text-cyan-500` | Cian |
| Mesa de Dulces | `text-rose-500` | Rosa fuerte |
| Meseros | `text-emerald-500` | Verde esmeralda |
| Mobiliario | `text-indigo-500` | Índigo |

---

## 🔤 Tipografía

### Fuentes del sistema

```typescript
// Definidas en src/app/layout.tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
```

Las fuentes se aplican al `<body>` a través del className:
```
className={`${geistSans.variable} ${geistMono.variable} antialiased`}
```

| Variable | Fuente | Uso |
|---|---|---|
| `--font-geist-sans` | Geist Sans | Texto general, headings, botones |
| `--font-geist-mono` | Geist Mono | Código, datos técnicos |

### Escala tipográfica usada en el sitio

| Clase Tailwind | Tamaño | Dónde se usa |
|---|---|---|
| `text-sm` | 14px | Texto de ayuda, badges, footer links |
| `text-base` | 16px | Texto de cuerpo |
| `text-lg` | 18px | Menú móvil, texto destacado |
| `text-xl` | 20px | Subtítulos de sección (value prop) |
| `text-2xl` | 24px | Texto descriptivo del hero |
| `text-3xl` | 30px | Headings de sección (H2) |
| `text-5xl` | 48px | Título hero (móvil) |
| `text-7xl` | 72px | Título hero (tablet) |
| `text-8xl` | 96px | Título hero (desktop) |

### Pesos tipográficos
- `font-light` — Texto descriptivo del hero
- `font-medium` — Navegación, etiquetas
- `font-semibold` — Nombres de categorías, badges
- `font-bold` — Headings, logo
- `font-black` — Título hero principal (`Local_Space`)

---

## 📐 Sistema de Layout

### Container
```javascript
// tailwind.config.js
container: {
    center: true,
    padding: "2rem",      // 32px de padding lateral
    screens: {
        "2xl": "1400px"   // Ancho máximo en pantallas grandes
    }
}
```

### Breakpoints (Tailwind por defecto)

| Breakpoint | Mínimo | Uso típico |
|---|---|---|
| `sm` | 640px | Pequeño (tablet pequeño) |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |
| `2xl` | 1536px | Pantallas muy grandes (max: 1400px) |

### Grid de categorías
```html
<!-- Responsive: 2 → 4 → 5 columnas -->
<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
```

---

## 🧩 Componentes del Sistema

### Navbar (`components/shared/navbar.tsx`)

**Estructura:**
```
<header> sticky, z-50, border-b, bg-background/95, backdrop-blur
  <div> container, h-16
    Logo (Home icon) + Nav links
    Sheet (menú móvil)
    CartSheet + Auth buttons / User dropdown
```

**Clases clave:**
| Elemento | Clases |
|---|---|
| Header | `sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60` |
| Container | `container flex h-16 items-center` |
| Links de nav | `transition-colors hover:text-foreground/80 text-foreground/60` |
| Link activo (provider) | `transition-colors hover:text-foreground/80 text-foreground font-bold text-primary` |
| Botón "Iniciar Sesión" | `variant="ghost" size="sm"` |
| Botón "Registrarse" | `size="sm"` (primario) |

**Comportamiento por rol:**
- **Visitante / Consumer:** Muestra "Catálogo" + "Proveedor" + botones "Iniciar Sesión" / "Registrarse"
- **Provider:** Muestra solo "Ir a mi Panel" (en azul primario)
- **Autenticado:** Muestra Avatar con dropdown (Perfil, Dashboard, Cerrar Sesión)

---

### Hero Section (`app/page.tsx`)

```
<section> relative h-[600px], bg-slate-950, text-white
  Carousel con autoplay (4 imágenes de Unsplash, delay 4000ms)
  Overlay: bg-black/60
  Contenido centrado:
    Badge: "La plataforma #1 para eventos sociales"
    H1: "Local_Space" — gradient text blanco→gris
    P: Descripción
    Botón: "Explorar Catálogo" (rounded-full, shadow)
    2 pills glassmorphism: Proveedores Verificados + Transparencia Total
```

**Clases clave del Hero:**
| Elemento | Clases |
|---|---|
| Título H1 | `text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400` |
| Badge | `px-4 py-2 bg-primary/20 text-white border-primary/50 backdrop-blur-sm` |
| Botón CTA | `rounded-full px-8 h-12 text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-105 transition-all` |
| Pills glassmorphism | `bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md` |
| Overlay oscuro | `absolute inset-0 bg-black/60 z-10` |

---

### Sección de Categorías

```
<section> py-20 bg-background
  H2: "Todo lo que necesitas"
  Grid 2→4→5 columnas
  Card por categoría: hover:shadow-lg, border-muted
    Icono con bg-muted, hover:bg-primary/10
    Label: font-semibold text-sm
```

---

### Value Proposition

```
<section> py-20 bg-slate-50 dark:bg-slate-900 border-y
  3 columnas (md:grid-cols-3)
  Cada columna:
    Ícono en caja: w-12 h-12 rounded-lg bg-primary/10 text-primary
    H3: font-bold text-xl
    P: text-muted-foreground
```

---

### CTA Section

```
<section> py-24
  div.container > div.bg-primary.rounded-2xl.p-12
    Texto blanco: H2 + P + Botón secondary
    2 círculos decorativos: bg-white/10, blur-2xl (top-left y bottom-right)
```

**Clases clave:**
| Elemento | Clases |
|---|---|
| Card CTA | `bg-primary text-primary-foreground rounded-2xl p-12 relative overflow-hidden` |
| Círculo decorativo 1 | `absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl` |
| Botón "Registrar Negocio" | `size="lg" variant="secondary" font-bold` |

---

### Footer (`components/shared/footer.tsx`)

```
<footer> border-t bg-muted/40
  Grid: flex-col → md:flex-row
    Columna 1: Logo + descripción (max-w-xs)
    Columna 2: Grid 2→3 columnas (Plataforma, Soporte, Legal)
  Barra inferior: copyright centrado
```

---

### Border Radius

```javascript
// tailwind.config.js
borderRadius: {
    lg: "var(--radius)",              // 0.5rem = 8px
    md: "calc(var(--radius) - 2px)",  // 6px
    sm: "calc(var(--radius) - 4px)",  // 4px
}
```

---

## ✨ Animaciones y Transiciones

| Nombre | Definición | Uso |
|---|---|---|
| `accordion-down` | Altura 0 → `--radix-accordion-content-height`, 0.2s ease-out | Acordeones (shadcn) |
| `accordion-up` | Altura contenido → 0, 0.2s ease-out | Acordeones (shadcn) |
| `hover:scale-105` | Escala 1 → 1.05 | Botón "Explorar Catálogo" del hero |
| `transition-all` | Transición suave de todas las propiedades | Botones CTA principales |
| `transition-colors` | Transición suave de colores | Links de navegación, cards |
| `hover:shadow-lg` | Sombra al hacer hover | Cards de categorías |
| Carousel autoplay | delay: 4000ms, sin pausar al interactuar | Hero con imágenes rotativas |

---

## 🗂️ Estructura de Rutas y Páginas

| Ruta | Página | Protegida con login |
|---|---|---|
| `/` | Landing principal | ❌ Pública |
| `/marketplace` | Catálogo de servicios | ❌ Pública |
| `/category/[slug]` | Categoría específica | ❌ Pública |
| `/login` | Página de login | ❌ Pública |
| `/register` | Registro de usuario/proveedor | ❌ Pública |
| `/dashboard/user` | Panel del consumidor | ✅ Requiere login (consumer) |
| `/dashboard/provider` | Panel del proveedor | ✅ Requiere login (provider) |
| `/dashboard/admin/*` | Panel de administración | ✅ Requiere login (admin) |
| `/payment/*` | Proceso de pago | ✅ Requiere login |

> **Nota:** Con el parche activo, **todas** las rutas son accesibles sin login.

---

## 📁 Archivos de Estilos Clave

```
frontend/
├── src/
│   ├── app/
│   │   └── globals.css          ← Variables CSS, tokens de color, estilos base
│   └── ...
├── tailwind.config.js            ← Config de colores, radius, animaciones, container
├── postcss.config.mjs            ← PostCSS (requerido por Tailwind)
└── components.json               ← Config de shadcn/ui (alias, estilo, base color)
```

### `components.json` (shadcn/ui config)
```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "blue",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## 🚀 Levantar el proyecto localmente

```bash
cd "canto proyect 2/canto_proyect/frontend"
npm install
npm run dev
```

El sitio correrá en: **http://localhost:3000**

Con el parche activo, puedes navegar todas las páginas sin credenciales.

---

*Guía generada el 2026-02-18 por revisión del código fuente del proyecto Local_Space.*
