const JsonRepository = require('../models/JsonRepository');
const Instructor = require('../models/Instructor');
const instructoresRepo = new JsonRepository('instructores.json');

// Lista general 
exports.obtenerTodos = async (req, res, next) => {
    try {
        const instructores = await instructoresRepo.leerTodos();
        res.status(200).json(instructores);
    } catch (error) {
        next(error);
    }
};

// Datos de un instructor específico por ID
exports.obtenerPorId = async (req, res, next) => {
    try {
        const instructor = await instructoresRepo.buscarPorId(req.params.id);
        if (!instructor) {
            return res.status(404).json({ error: "No encontrado", detalle: "Instructor no registrado." });
        }
        res.status(200).json(instructor);
    } catch (error) {
        next(error);
    }
};

// Registro de un nuevo instructor
exports.crear = async (req, res, next) => {
    try {
        const { nombre, apellido, especialidad, email } = req.body;
        if (!nombre || !apellido || !especialidad || !email) {
            return res.status(400).json({
                error: "Datos incompletos",
                detalle: "Nombre, apellido, especialidad y email son obligatorios."
            });
        }
        const idNuevo = await instructoresRepo.obtenerSiguienteId();
        const nuevoInstructor = new Instructor(idNuevo, nombre, apellido, especialidad, email);
        await instructoresRepo.crear(nuevoInstructor);
        res.status(201).json({ mensaje: "Instructor creado exitosamente", instructor: nuevoInstructor });
    } catch (error) {
        next(error);
    }
};

// Modificación de datos del instructor
exports.actualizar = async (req, res, next) => {
    try {
        const actualizado = await instructoresRepo.actualizar(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ error: "No encontrado", detalle: "Instructor no encontrado para actualizar." });
        }
        res.status(200).json({ mensaje: "Instructor actualizado exitosamente", instructor: actualizado });
    } catch (error) {
        next(error);
    }
};

// Baja de un instructor del registro
exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await instructoresRepo.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: "No encontrado", detalle: "Instructor no encontrado para eliminar." });
        }
        res.status(200).json({ mensaje: "Instructor eliminado correctamente." });
    } catch (error) {
        next(error);
    }
};
