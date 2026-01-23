const { body, query, param, validationResult } = require('express-validator');

// Middleware para verificar resultados de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: errors.array()
        });
    }
    next();
};

// Validaciones para crear servicio
const validateCreateService = [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('category').trim().notEmpty().withMessage('La categoría es requerida'),
    body('price').isNumeric().withMessage('El precio debe ser numérico').isFloat({ min: 0 }).withMessage('El precio debe ser positivo'),
    body('description').optional().trim(),
    body('image_url').optional().isURL().withMessage('La URL de la imagen debe ser válida'),
    body('provider_id').optional().isUUID().withMessage('El ID del proveedor debe ser un UUID válido'),
    validate
];

// Validaciones para filtro de presupuesto
const validateBudgetFilter = [
    query('presupuesto').optional().isNumeric().withMessage('El presupuesto debe ser numérico').isFloat({ min: 0 }).withMessage('El presupuesto debe ser positivo'),
    validate
];

// Validaciones para verificar servicio
const validateVerifyService = [
    param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    validate
];

module.exports = {
    validateCreateService,
    validateBudgetFilter,
    validateVerifyService
};
