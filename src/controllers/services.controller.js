const supabase = require('../config/supabase');

// Obtener servicios verificados con filtro opcional de presupuesto
const getServices = async (req, res, next) => {
    try {
        const { presupuesto, category } = req.query;

        let query = supabase
            .from('services')
            .select('*')
            .eq('is_verified', true)
            .order('id', { ascending: false });

        // Filtro por presupuesto
        if (presupuesto) {
            query = query.lte('price', parseFloat(presupuesto));
        }

        // Filtro por categoría
        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

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

// Crear nuevo servicio
const createService = async (req, res, next) => {
    try {
        const serviceData = {
            ...req.body,
            is_verified: false // Por defecto no verificado
        };

        const { data, error } = await supabase
            .from('services')
            .insert([serviceData])
            .select();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Servicio creado exitosamente. Pendiente de verificación.',
            data: data[0]
        });
    } catch (error) {
        next(error);
    }
};

// Obtener un servicio por ID
const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Servicio no encontrado'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getServices,
    createService,
    getServiceById
};
