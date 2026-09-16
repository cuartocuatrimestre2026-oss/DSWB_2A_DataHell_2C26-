const JsonRepository = require('../models/JsonRepository');
const Sala = require('../models/Sala');
const salasRepo = new JsonRepository('salas.json');

// Lista completa de espacios físicos y capacidades
exports.obtenerTodos = async (req, res, next) => {
    try {
        const salas = await salasRepo.leerTodos();
        res.status(200).json(salas);
    } catch (error) {
        next(error);
    }
};

// Consulta de aforo y características espaciales por ID
exports.obtenerPorId = async (req, res, next) => {
    try {
        const salaData = await salasRepo.buscarPorId(req.params.id);
        if (!salaData) {
            return res.status(404).json({ error: "No encontrado", detalle: "Sala no registrada." });
        }
        const sala = new Sala(salaData.id, salaData.nombre, salaData.capacidadNormal);
        res.status(200).json({
            ...salaData,
            sobreturnosPermitidos: sala.calcularSobreturnosPermitidos()
        });
    } catch (error) {
        next(error);
    }
};

// Alta de un nuevo espacio
exports.crear = async (req, res, next) => {
    try {
        const { nombre, capacidadNormal } = req.body;
        if (!nombre || capacidadNormal === undefined || isNaN(Number(capacidadNormal))) {
            return res.status(400).json({
                error: "Datos incompletos",
                detalle: "Nombre y capacidadNormal numérica son obligatorios."
            });
        }
        const idNuevo = await salasRepo.obtenerSiguienteId();
        const nuevaSala = new Sala(idNuevo, nombre, Number(capacidadNormal));
        await salasRepo.crear(nuevaSala);
        res.status(201).json({ mensaje: "Sala creada exitosamente", sala: nuevaSala });
    } catch (error) {
        next(error);
    }
};

// Modificación de datos de una sala
exports.actualizar = async (req, res, next) => {
    try {
        const actualizado = await salasRepo.actualizar(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ error: "No encontrado", detalle: "Sala no encontrada para actualizar." });
        }
        res.status(200).json({ mensaje: "Sala actualizada exitosamente", sala: actualizado });
    } catch (error) {
        next(error);
    }
};

// Retiro de una sala del sistema
exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await salasRepo.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: "No encontrado", detalle: "Sala no encontrada para eliminar." });
        }
        res.status(200).json({ mensaje: "Sala eliminada correctamente." });
    } catch (error) {
        next(error);
    }
};
