const express = require('express');
const router = express.Router();
const {
    getServices,
    createService,
    getServiceById
} = require('../controllers/services.controller');
const {
    validateCreateService,
    validateBudgetFilter
} = require('../middleware/validation');

// GET /servicios - Obtener servicios verificados
router.get('/', validateBudgetFilter, getServices);

// GET /servicios/:id - Obtener un servicio por ID
router.get('/:id', getServiceById);

// POST /servicios - Crear nuevo servicio
router.post('/', validateCreateService, createService);

module.exports = router;
