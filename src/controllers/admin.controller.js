const supabase = require('../config/supabase');

// Verificar un servicio (solo admin)
const verifyService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('services')
            .update({ is_verified: true })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Servicio no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Servicio verificado exitosamente',
            data: data[0]
        });
    } catch (error) {
        next(error);
    }
};

// Obtener servicios pendientes de verificación
const getPendingServices = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('is_verified', false)
            .order('id', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
};

// Rechazar un servicio
const rejectService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Servicio rechazado y eliminado'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyService,
    getPendingServices,
    rejectService
};
