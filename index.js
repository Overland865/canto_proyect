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
