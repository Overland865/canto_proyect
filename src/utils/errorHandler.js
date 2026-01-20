// Manejador centralizado de errores
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de Supabase
    if (err.code) {
        return res.status(400).json({
            error: 'Error en la base de datos',
            message: err.message,
            code: err.code
        });
    }

    // Error genérico
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
    });
};

// Manejador de rutas no encontradas
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
};

module.exports = { errorHandler, notFoundHandler };
