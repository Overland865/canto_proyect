const express = require('express');
const router = express.Router();
const {
    verifyService,
    getPendingServices,
    rejectService
} = require('../controllers/admin.controller');
const { validateVerifyService } = require('../middleware/validation');

// GET /admin/servicios-pendientes - Obtener servicios pendientes
router.get('/servicios-pendientes', getPendingServices);

// PATCH /admin/verificar-servicio/:id - Verificar servicio
router.patch('/verificar-servicio/:id', validateVerifyService, verifyService);

// DELETE /admin/rechazar-servicio/:id - Rechazar servicio
router.delete('/rechazar-servicio/:id', validateVerifyService, rejectService);

module.exports = router;
