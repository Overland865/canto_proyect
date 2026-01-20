const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración de helmet para seguridad HTTP
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
});

// Limitador de peticiones para prevenir ataques DDoS
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 peticiones por ventana
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { helmetConfig, limiter };
