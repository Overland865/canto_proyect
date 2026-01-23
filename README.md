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
   - Completar con tus credenciales de Supabase:
     ```env
     SUPABASE_URL=https://tu-proyecto.supabase.co
     SUPABASE_KEY=tu-clave-anon-publica
     ```

4. **Iniciar el servidor**
   ```bash
   # Modo desarrollo (con auto-reload)
   npm run dev

   # Modo producción
   npm start
   ```

## 📡 Endpoints Disponibles

### Servicios

- **GET** `/servicios` - Obtener servicios verificados
  - Query params: `?presupuesto=5000&category=Local`
  
- **GET** `/servicios/:id` - Obtener servicio por ID

- **POST** `/servicios` - Crear nuevo servicio
  - Body: 
    ```json
    {
      "name": "Nombre del servicio",
      "category": "Categoría",
      "price": 3000,
      "description": "Descripción",
      "image_url": "https://...",
      "provider_id": "uuid-del-proveedor"
    }
    ```

### Administración

- **GET** `/admin/servicios-pendientes` - Servicios pendientes de verificación

- **PATCH** `/admin/verificar-servicio/:id` - Verificar servicio

- **DELETE** `/admin/rechazar-servicio/:id` - Rechazar servicio

## 🔒 Seguridad

- Rate limiting: 100 peticiones por 15 minutos
- Validación de datos en todas las rutas
- Headers de seguridad con Helmet
- CORS configurado

## 🧪 Pruebas

Usar Thunder Client o Postman para probar los endpoints.

### Ejemplo: Crear servicio
```bash
POST http://localhost:3000/servicios
Content-Type: application/json

{
  "name": "Salón de Eventos El Dorado",
  "category": "Local para eventos",
  "price": 3000,
  "description": "Salón amplio con capacidad para 200 personas",
  "image_url": "https://ejemplo.com/imagen.jpg",
  "provider_id": "uuid-del-proveedor"
}
```

## 📁 Estructura del Proyecto

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
├── .env                          # Variables de entorno
├── .gitignore
├── index.js                      # Punto de entrada
├── package.json
└── README.md
```

## 📞 Soporte

Contactar a Kin o Martin para cualquier duda.

---

**Desarrollado por**: Kin y Martin  
**Proyecto**: Local_Space Backend API
