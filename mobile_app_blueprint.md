# Documentación Funcional: Roles y Capacidades - Proyecto "Local_Space"

Este documento define las **acciones y capacidades específicas** para cada rol de usuario en la aplicación móvil, basado estrictamente en la funcionalidad actual de la plataforma web.

## 1. Perfil: Consumidor (Cliente)
El consumidor es el usuario final que busca contratar servicios para su evento.

### Capacidades Principales
*   **Exploración y Búsqueda:**
    *   **Buscar servicios** por nombre o palabra clave desde la pantalla de inicio.
    *   **Navegar por categorías** predefinidas (Ej. Banquetes, Música, Mobiliario).
    *   **Filtrar resultados** en el marketplace por:
        *   Categoría.
        *   Rango de precios (mínimo - máximo).
        *   Ubicación (Región).
*   **Visualización de Servicios:**
    *   Ver tarjetas de resumen en el listado (Imagen, Título, Precio, Calificación).
    *   Ver **detalle completo** del servicio:
        *   Galería de imágenes (carrusel/grid).
        *   Descripción detallada y qué incluye.
        *   Información del proveedor (Nombre, verificación).
*   **Gestión de Reservas (Booking):**
    *   **Solicitar Cotización/Reserva:** Seleccionar fecha, hora y número de invitados en el calendario del servicio.
    *   **Monitorear Estado:** Ver lista de reservas filtrada por estado (Pendientes, Confirmadas, Historial).
    *   **Ver detalles de reserva:** Consultar fecha agendada, costo total y estado actual.
*   **Gestión de Cuenta:**
    *   Registrarse como Consumidor.
    *   Editar información de perfil (Nombre, Apellido).
    *   Cerrar sesión.

---

## 2. Perfil: Proveedor (Vendedor)
El proveedor es el usuario que ofrece servicios y gestiona su negocio dentro de la plataforma.

### Capacidades Principales
*   **Gestión de Catálogo (Servicios):**
    *   **Crear nuevo servicio:**
        *   Definir Título, Descripción, Precio, Categoría, Ubicación.
        *   Subir imagen principal y galería de fotos (hasta 5).
        *   Definir tipo (Servicio individual o Paquete).
    *   **Editar servicio:** Modificar cualquier dato o imagen de un servicio existente.
    *   **Eliminar servicio:** Borrar un servicio del catálogo.
    *   **Listar servicios propios:** Vista rápida de todos los servicios activos.
*   **Gestión de Reservas (CRM):**
    *   **Recibir solicitudes:** Notificación/Vista de nuevas reservas en estado "Pendiente".
    *   **Aceptar Reserva:** Confirmar la disponibilidad y el servicio. (Cambia estado a `confirmed`).
    *   **Rechazar Reserva:** Declinar la solicitud. (Cambia estado a `rejected`).
    *   **Reprogramar:** Proponer una nueva fecha al cliente si la solicitada no está disponible.
*   **Dashboard y Métricas:**
    *   **Visualizar KPIs:**
        *   **Ingresos Totales:** Suma de montos de reservas confirmadas/completadas.
        *   **Servicios Activos:** Cantidad de anuncios publicados.
        *   **Vistas del Perfil:** Contador de visitas a su perfil público.
    *   Ver listado de "Últimas Reservas" para acción rápida.
*   **Configuración de Negocio (Perfil Público):**
    *   **Información Básica:** Editar Nombre del Negocio y Descripción.
    *   **Medios:** Subir/Cambiar Foto de Portada y Galería del Negocio.
    *   **Contacto:** Agregar/Editar Teléfono, Sitio Web y enlaces a Redes Sociales (Facebook, Instagram, etc.).
    *   **Seguridad:** Gestión de contraseña y notificaciones (correo).

---

## 3. Matriz de Acciones por Estado de Reserva
El ciclo de vida de una reserva habilita acciones específicas para cada rol:

| Estado de Reserva | Acción Consumidor | Acción Proveedor |
| :--- | :--- | :--- |
| **Pendiente** | Cancelar solicitud | Aceptar / Rechazar / Reprogramar |
| **Confirmada** | Ver detalles de contacto | Marcar como Completada (post-evento) |
| **Rechazada** | Ver motivo (si aplica) | *Ninguna* |
| **Reprogramada** | Aceptar nueva fecha / Rechazar | Esperar respuesta |
| **Completada** | Calificar servicio (Review) | Ver en historial de ingresos |

---

## 4. Notas Técnicas para Móvil
*   **Persistencia:** La sesión debe mantenerse activa (Token persistente) hasta que el usuario decida salir explícitamente.
*   **Sincronización:** Las listas de reservas deben actualizarse en tiempo real (o pull-to-refresh) para reflejar cambios de estado hechos por la contraparte.
*   **Multimedia:** La app debe solicitar permisos nativos para acceder a **Cámara y Galería** al momento de crear servicios o editar perfil.
