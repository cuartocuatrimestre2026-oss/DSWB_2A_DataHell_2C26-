const JsonRepository = require('../models/JsonRepository');
const Servicio = require('../models/Servicio');
const serviciosRepo = new JsonRepository('servicios.json');

// Obtener catálogo completo de servicios / disciplinas
exports.obtenerTodos = async (req, res, next) => {
    try {
        const servicios = await serviciosRepo.leerTodos();
        res.status(200).json(servicios);
    } catch (error) {
        next(error);
    }
};

// Obtener parámetros específicos de un servicio por ID
exports.obtenerPorId = async (req, res, next) => {
    try {
        const servicio = await serviciosRepo.buscarPorId(req.params.id);
        if (!servicio) {
            return res.status(404).json({ error: "No encontrado", detalle: "Servicio no registrado." });
        }
        res.status(200).json(servicio);
    } catch (error) {
        next(error);
    }
};

// Alta de nueva disciplina / servicio
exports.crear = async (req, res, next) => {
    try {
        const { nombre, modalidad, duracionMinutos, salaRequerida } = req.body;
        if (!nombre || !modalidad || !duracionMinutos || !salaRequerida) {
            return res.status(400).json({
                error: "Datos incompletos",
                detalle: "Nombre, modalidad, duración en minutos y sala requerida son obligatorios."
            });
        }
        const idNuevo = await serviciosRepo.obtenerSiguienteId();
        const salaReqParsed = !isNaN(Number(salaRequerida)) ? Number(salaRequerida) : salaRequerida;
        const nuevoServicio = new Servicio(idNuevo, nombre, modalidad.toUpperCase(), Number(duracionMinutos), salaReqParsed);
        await serviciosRepo.crear(nuevoServicio);
        res.status(201).json({ mensaje: "Servicio creado exitosamente", servicio: nuevoServicio });
    } catch (error) {
        next(error);
    }
};

// Actualización de datos del servicio
exports.actualizar = async (req, res, next) => {
    try {
        const actualizado = await serviciosRepo.actualizar(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ error: "No encontrado", detalle: "Servicio no encontrado para actualizar." });
        }
        res.status(200).json({ mensaje: "Servicio actualizado exitosamente", servicio: actualizado });
    } catch (error) {
        next(error);
    }
};

// Remoción de un servicio de la oferta
exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await serviciosRepo.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: "No encontrado", detalle: "Servicio no encontrado para eliminar." });
        }
        res.status(200).json({ mensaje: "Servicio eliminado correctamente." });
    } catch (error) {
        next(error);
    }
};
