const JsonRepository = require('../models/JsonRepository');
const Cliente = require('../models/Cliente');
const clientesRepo = new JsonRepository('clientes.json');

//Obtener el listado completo de Clientes
exports.obtenerTodos = async (req, res, next) => {
    try {
        const clientes = await clientesRepo.leerTodos();
        res.status(200).json(clientes);
    } catch (error) { next(error); }
};

// Obtener un cliente por ID
exports.obtenerPorId = async (req, res, next) => {
    try {
        const cliente = await clientesRepo.buscarPorId(req.params.id);
        if (!cliente) return res.status(404).json({ error: "No encontrado", detalle: "Cliente no registrado." });
        res.status(200).json(cliente);
    } catch (error) { next(error); }
};


// Alta de Cliente
exports.crear = async (req, res, next) => {
    try {
        const { nombre, apellido, dni, email, telefono } = req.body;
        if (!nombre || !apellido || !dni || !email) {
            return res.status(400).json({ error: "Datos incompletos", detalle: "Nombre, apellido, DNI y email son obligatorios." });
        }
        const idNuevo = await clientesRepo.obtenerSiguienteId();
        const nuevoCliente = new Cliente(idNuevo, nombre, apellido, dni, email, telefono || "");
        await clientesRepo.crear(nuevoCliente);
        res.status(201).json({ mensaje: "Cliente creado exitosamente", cliente: nuevoCliente });
    } catch (error) { next(error); }
};


// Actualziar datos del cliente
exports.actualizar = async (req, res, next) => {
    try {
        const actualizado = await clientesRepo.actualizar(req.params.id, req.body);
        if (!actualizado) return res.status(404).json({ error: "No encontrado", detalle: "Cliente no encontrado para actualizar." });
        res.status(200).json(actualizado);
    } catch (error) { next(error); }
};


//Eliminar cliente por ID
exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await clientesRepo.eliminar(req.params.id);
        if (!eliminado) return res.status(404).json({ error: "No encontrado", detalle: "Cliente no encontrado para eliminar." });
        res.status(200).json({ mensaje: "Cliente eliminado correctamente." });
    } catch (error) { next(error); }
};