const JsonRepository = require('../models/JsonRepository');
const Sala = require('../models/Sala');
const Turno = require('../models/Turno');

const turnosRepo = new JsonRepository('turnos.json');
const clientesRepo = new JsonRepository('clientes.json');
const serviciosRepo = new JsonRepository('servicios.json');
const instructoresRepo = new JsonRepository('instructores.json');
const salasRepo = new JsonRepository('salas.json');

// Listado completo
exports.obtenerTodos = async (req, res, next) => {
    try {
        const turnos = await turnosRepo.leerTodos();
        res.status(200).json(turnos);
    } catch (error) {
        next(error);
    }
};


// Turnos por Id de Turno
exports.obtenerPorId = async (req, res, next) => {
    try {
        const turno = await turnosRepo.buscarPorId(req.params.id);
        if (!turno) {
            return res.status(404).json({ error: "No encontrado", detalle: "El turno solicitado no existe." });
        }
        res.status(200).json(turno);
    } catch (error) {
        next(error);
    }
};


// Turnos por Id de Cliente
exports.obtenerPorCliente = async (req, res, next) => {
    try {
        const turnos = await turnosRepo.leerTodos();
        const turnosCliente = turnos.filter(t => String(t.clienteId) === String(req.params.id) || Number(t.clienteId) === Number(req.params.id));
        res.status(200).json(turnosCliente);
    } catch (error) {
        next(error);
    }
};

// Turnos por Id del Instructor (Grilla horaria de un docente)
exports.obtenerPorInstructor = async (req, res, next) => {
    try {
        const turnos = await turnosRepo.leerTodos();
        const turnosInstructor = turnos.filter(t => String(t.instructorId) === String(req.params.id) || Number(t.instructorId) === Number(req.params.id));
        res.status(200).json(turnosInstructor);
    } catch (error) {
        next(error);
    }
};

// Crear Turno por Id del Instructor
exports.crearRegular = async (req, res, next) => {
    try {
        const { clienteId, servicioId, instructorId, salaId, fechaHora } = req.body;

        if (!clienteId || !servicioId || !instructorId || !salaId || !fechaHora) {
            return res.status(400).json({ error: "Validación fallida", detalle: "Todos los campos son obligatorios." });
        }

        const [cliente, servicio, instructor, salaData] = await Promise.all([
            clientesRepo.buscarPorId(clienteId),
            serviciosRepo.buscarPorId(servicioId),
            instructoresRepo.buscarPorId(instructorId),
            salasRepo.buscarPorId(salaId)
        ]);

        if (!cliente || !servicio || !instructor || !salaData) {
            return res.status(404).json({ error: "Entidad inexistente", detalle: "Cliente, servicio, instructor o sala no encontrados." });
        }

        const turnos = await turnosRepo.leerTodos();
        const fechaHoraISO = new Date(fechaHora).toISOString();

        // Se evita la superposicion de horarios para un mismo instructor
        const instructorOcupado = turnos.some(t =>
            (String(t.instructorId) === String(instructorId) || Number(t.instructorId) === Number(instructorId)) &&
            t.fechaHora === fechaHoraISO &&
            t.estado === "reservado"
        );
        if (instructorOcupado) {
            return res.status(409).json({ error: "Conflicto", detalle: "El instructor ya cuenta con un turno en dicho horario." });
        }

        // Se evita la asignacion de dos turnos para el mismo cliente en el mismo horario
        const clienteOcupado = turnos.some(t =>
            (String(t.clienteId) === String(clienteId) || Number(t.clienteId) === Number(clienteId)) &&
            t.fechaHora === fechaHoraISO &&
            t.estado === "reservado"
        );
        if (clienteOcupado) {
            return res.status(409).json({ error: "Conflicto", detalle: "El cliente ya tiene una reserva en ese horario." });
        }

        // Se controla la capacidad total de la sala para turnos regulares
        const reservasRegularesSala = turnos.filter(t =>
            (String(t.salaId) === String(salaId) || Number(t.salaId) === Number(salaId)) &&
            t.fechaHora === fechaHoraISO &&
            t.estado === "reservado" &&
            !t.esSobreturno
        ).length;

        if (reservasRegularesSala >= salaData.capacidadNormal) {
            return res.status(409).json({
                error: "Capacidad completa",
                detalle: "El aforo regular de la sala está lleno. Solo recepción puede autorizar un sobreturno justificado."
            });
        }

        const idNuevo = await turnosRepo.obtenerSiguienteId();
        const nuevoTurno = new Turno(idNuevo, Number(clienteId), Number(servicioId), Number(instructorId), Number(salaId), fechaHoraISO, "reservado", false, null);

        await turnosRepo.crear(nuevoTurno);
        res.status(201).json({ mensaje: "Turno regular registrado exitosamente", turno: nuevoTurno });
    } catch (error) {
        next(error);
    }
};

// Alta de Sobreturno solo para la recepcion
exports.crearSobreturno = async (req, res, next) => {
    try {
        const { clienteId, servicioId, instructorId, salaId, fechaHora, motivo } = req.body;

        if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 5) {
            return res.status(400).json({
                error: "Validación fallida",
                detalle: "El campo 'motivo' es mandatorio para sobreturnos (mínimo 5 caracteres)."
            });
        }

        const salaData = await salasRepo.buscarPorId(salaId);
        if (!salaData) {
            return res.status(404).json({ error: "No encontrado", detalle: "Sala no encontrada." });
        }

        const sala = new Sala(salaData.id, salaData.nombre, salaData.capacidadNormal);
        const turnos = await turnosRepo.leerTodos();
        const fechaHoraISO = new Date(fechaHora).toISOString();

        const sobreturnosActuales = turnos.filter(t =>
            (String(t.salaId) === String(salaId) || Number(t.salaId) === Number(salaId)) &&
            t.fechaHora === fechaHoraISO &&
            t.estado === "reservado" &&
            t.esSobreturno
        ).length;

        if (!sala.admiteSobreturno(sobreturnosActuales)) {
            return res.status(409).json({
                error: "Límite excedido",
                detalle: `Se alcanzó el tope máximo del 15% de sobrecupo permitido para esta sala (${sala.calcularSobreturnosPermitidos()} lugar/es).`
            });
        }

        const idNuevo = await turnosRepo.obtenerSiguienteId();
        const nuevoTurno = new Turno(idNuevo, Number(clienteId), Number(servicioId), Number(instructorId), Number(salaId), fechaHoraISO, "reservado", true, motivo.trim());

        await turnosRepo.crear(nuevoTurno);
        res.status(201).json({ mensaje: "Sobreturno autorizado y registrado exitosamente", turno: nuevoTurno });
    } catch (error) {
        next(error);
    }
};


// Cancelacion de Turno (DELETE /turnos/:id)
exports.cancelar = async (req, res, next) => {
    try {
        const turnoData = await turnosRepo.buscarPorId(req.params.id);
        if (!turnoData) {
            return res.status(404).json({ error: "No encontrado", detalle: "El turno a cancelar no existe." });
        }

        const turno = new Turno(
            turnoData.id, turnoData.clienteId, turnoData.servicioId,
            turnoData.instructorId, turnoData.salaId, turnoData.fechaHora,
            turnoData.estado, turnoData.esSobreturno, turnoData.motivoSobreturno
        );
        turno.cancelar();
        await turnosRepo.actualizar(req.params.id, { estado: turno.estado });
        res.status(200).json({ mensaje: "Turno cancelado exitosamente", turno });
    } catch (error) {
        next(error);
    }
};

// Transición y actualización de estados del turno (PUT /turnos/:id)
exports.actualizarEstado = async (req, res, next) => {
    try {
        const { estado } = req.body;
        const turnoData = await turnosRepo.buscarPorId(req.params.id);
        if (!turnoData) {
            return res.status(404).json({ error: "No encontrado", detalle: "El turno solicitado no existe." });
        }

        const turno = new Turno(
            turnoData.id, turnoData.clienteId, turnoData.servicioId,
            turnoData.instructorId, turnoData.salaId, turnoData.fechaHora,
            turnoData.estado, turnoData.esSobreturno, turnoData.motivoSobreturno
        );

        if (estado === "atendido") {
            turno.atender();
        } else if (estado === "cancelado") {
            turno.cancelar();
        } else if (estado === "reservado") {
            turno.estado = "reservado";
        } else if (estado) {
            return res.status(400).json({
                error: "Estado inválido",
                detalle: "Los estados válidos son: 'reservado', 'atendido', 'cancelado'."
            });
        }

        const datosActualizados = await turnosRepo.actualizar(req.params.id, {
            ...req.body,
            estado: turno.estado
        });

        res.status(200).json({
            mensaje: "Turno actualizado correctamente",
            turno: datosActualizados
        });
    } catch (error) {
        next(error);
    }
};