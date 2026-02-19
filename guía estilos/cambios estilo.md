# 📋 Cambios de Estilo — Local_Space

> **Fecha:** 2026-02-18  
> **Autor:** Martín Ortiz  
> **Objetivo:** Rediseño visual del sitio para mejorar la experiencia de usuario, pasando de una paleta azul genérica a una identidad cálida con fondo beige, acento ámbar y navbar azul marino.

---

## ✅ Cambio 1 — Parche: Modo Vista de Estilos (Sin Login)

**Fecha:** 2026-02-18  
**Motivo:** Permitir navegar todo el sitio sin necesidad de credenciales para revisar los estilos libremente.

### Archivos modificados

#### `src/lib/preview-mode.ts` *(archivo nuevo)*
```typescript
// Cambia a false para restaurar el auth real
export const STYLE_PREVIEW_MODE = true
```

#### `src/middleware.ts`
- **Antes:** El middleware llamaba a `updateSession(request)` de Supabase, que redirigía a `/login` si no había sesión activa.
- **Después:** Se reemplazó por `NextResponse.next()` para dejar pasar todas las rutas sin verificación.

```typescript
// ANTES
return await updateSession(request)

// DESPUÉS
return NextResponse.next()
```

#### `src/context/auth-context.tsx`
- Se importa `STYLE_PREVIEW_MODE` desde `preview-mode.ts`
- Cuando el flag está activo:
  - Se inyecta un **usuario demo** (`Demo Usuario`, rol: `consumer`) sin llamar a Supabase
  - El cliente de Supabase nunca se instancia: `STYLE_PREVIEW_MODE ? null : createClient()`
  - El `useEffect` de verificación de sesión se salta con `if (STYLE_PREVIEW_MODE) return`
  - Las funciones `login()`, `register()` y `logout()` devuelven un resultado simulado

#### `src/context/provider-context.tsx`
- Se importa `STYLE_PREVIEW_MODE`
- El cliente Supabase es condicional: `STYLE_PREVIEW_MODE ? null : createClient()`
- Los dos `useEffect` que hacen fetch de servicios y bookings tienen guard `if (STYLE_PREVIEW_MODE) return`
- `isLoading` inicia en `false` en modo preview para no bloquear la UI

#### `src/app/page.tsx`
- Se eliminó el **panel de debug verde** (development artifact) que mostraba `IS AUTH / User Role / User ID / Auth Error` sobre el hero

---

## ✅ Cambio 2 — Nueva Paleta de Colores Global

**Fecha:** 2026-02-18  
**Motivo:** Cambiar la identidad visual del sitio de azul genérico a una paleta cálida con mejor UX, basada en imágenes de referencia del equipo.

### Archivo modificado: `src/app/globals.css`

#### Paleta anterior (v1)
| Token | Valor | Color |
|---|---|---|
| `--background` | `0 0% 100%` | Blanco puro |
| `--foreground` | `222.2 84% 4.9%` | Azul casi negro |
| `--primary` | `221.2 83.2% 53.3%` | Azul brillante |
| `--secondary` | `210 40% 96.1%` | Gris azulado |
| `--muted` | `210 40% 96.1%` | Gris azulado |
| `--border` | `214.3 31.8% 91.4%` | Gris claro |
| `--ring` | `221.2 83.2% 53.3%` | Azul |

#### Paleta nueva (v2 — ACTIVA) ✨
| Token | Valor HSL | Color visual | Uso |
|---|---|---|---|
| `--background` | `38 25% 83%` | 🏜️ Beige/arena cálido | Fondo principal |
| `--foreground` | `220 55% 18%` | 🌊 Azul marino oscuro | Texto principal |
| `--card` | `0 0% 100%` | ⬜ Blanco puro | Fondo de cards |
| `--primary` | `32 72% 47%` | 🟠 Ámbar/dorado cálido | Botones CTA, acciones |
| `--primary-foreground` | `0 0% 100%` | Blanco | Texto sobre botones |
| `--secondary` | `38 22% 92%` | Arena muy claro | Fondos sutiles |
| `--muted` | `38 20% 88%` | Beige apagado | Áreas de baja importancia |
| `--muted-foreground` | `220 25% 45%` | Azul grisáceo | Subtextos, placeholders |
| `--accent` | `32 72% 47%` | 🟠 Ámbar | Hover states |
| `--border` | `38 18% 72%` | Beige medio | Bordes |
| `--input` | `38 18% 72%` | Beige medio | Bordes de inputs |
| `--ring` | `32 72% 47%` | Ámbar | Focus ring |
| `--navy` *(variable custom)* | `220 55% 18%` | 🌊 Azul marino | Referencia de color navbar |

#### Modo oscuro (`.dark`) — también actualizado
| Token | Valor HSL | Cambio |
|---|---|---|
| `--background` | `220 55% 10%` | Azul marino muy oscuro (antes: azul neutro) |
| `--foreground` | `38 25% 90%` | Beige claro (antes: blanco frío) |
| `--primary` | `32 72% 52%` | Ámbar ligeramente más brillante |
| `--card` | `220 55% 14%` | Azul marino con más luz |

---

## ✅ Cambio 3 — Rediseño del Navbar

**Fecha:** 2026-02-18  
**Motivo:** El navbar usaba `bg-background` (blanco en la paleta anterior). Con la nueva paleta debería ser azul marino oscuro para contrast con el fondo beige de la página, tal como en las imágenes de referencia.

### Archivo modificado: `src/components/shared/navbar.tsx`

#### Elemento `<header>`
```tsx
// ANTES
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur ...">

// DESPUÉS
<header className="sticky top-0 z-50 w-full border-b border-[hsl(220,55%,12%)] bg-[hsl(220,55%,18%)] text-white shadow-md">
```

| Propiedad | Antes | Después |
|---|---|---|
| Fondo | `bg-background/95` (blanco semitransparente) | `bg-[hsl(220,55%,18%)]` — azul marino rico |
| Borde inferior | `border-b` (gris/defecto) | `border-[hsl(220,55%,12%)]` — azul más oscuro |
| Texto base | Heredado del foreground | `text-white` — blanco explícito |
| Efecto backdrop | `backdrop-blur` | Eliminado (fondo sólido) |
| Sombra | Sin sombra | `shadow-md` |

#### Links de navegación
```tsx
// ANTES
className="transition-colors hover:text-foreground/80 text-foreground/60"

// DESPUÉS
className="transition-colors hover:text-primary text-white/80"
```

| Estado | Antes | Después |
|---|---|---|
| Normal | `text-foreground/60` (azul apagado) | `text-white/80` — blanco 80% |
| Hover | `hover:text-foreground/80` | `hover:text-primary` — ámbar dorado |
| Link activo (provider) | `text-foreground font-bold text-primary` | `text-white font-bold hover:text-primary` |

#### Botones de auth (visitante)
```tsx
// ANTES
<Button variant="ghost" size="sm">Iniciar Sesión</Button>
<Button size="sm">Registrarse</Button>

// DESPUÉS
<Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
  Iniciar Sesión
</Button>
<Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
  Registrarse
</Button>
```

#### Avatar (usuario autenticado)
```tsx
// ANTES
<AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>

// DESPUÉS
<AvatarFallback className="bg-primary text-white font-bold">
  {user?.name?.charAt(0).toUpperCase()}
</AvatarFallback>
```
Avatar fallback ahora tiene fondo ámbar en lugar de gris.

#### Menú móvil (Sheet)
- Fondo: `bg-[hsl(220,55%,18%)]` — azul marino (igual que navbar)
- Borde: `border-r border-[hsl(220,55%,12%)]`
- Texto: `text-white` con `text-white/80` para links normales

---

## 📁 Resumen de Archivos Modificados

| Archivo | Tipo de cambio |
|---|---|
| `src/lib/preview-mode.ts` *(nuevo)* | Flag central para modo sin login |
| `src/middleware.ts` | Desactivar verificación de sesión |
| `src/context/auth-context.tsx` | Usuario demo, skip Supabase |
| `src/context/provider-context.tsx` | Skip Supabase en modo preview |
| `src/app/page.tsx` | Eliminar panel de debug |
| `src/app/globals.css` | **Paleta completa nueva** (beige + navy + ámbar) |
| `src/components/shared/navbar.tsx` | **Navbar azul marino** con texto blanco |

---

## 🔄 Cómo Revertir los Cambios

### Revertir solo el modo preview (restaurar auth real)
Editar **un solo archivo**: `src/lib/preview-mode.ts`
```typescript
export const STYLE_PREVIEW_MODE = false  // ← cambiar de true a false
```

### Revertir toda la paleta de colores
Restaurar `src/app/globals.css` a los valores originales de shadcn/ui (paleta azul predeterminada):
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... resto de variables originales */
}
```

### Revertir el navbar
En `src/components/shared/navbar.tsx`, cambiar el `<header>`:
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
```

---

*Documento generado el 2026-02-18. Proyecto: Local_Space frontend (Next.js 16 + Tailwind CSS + shadcn/ui).*
