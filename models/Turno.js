class Turno {
    constructor(id, clienteId, servicioId, instructorId, salaId, fechaHora, estado = "reservado", esSobreturno = false, motivoSobreturno = null) {
        this.id = !isNaN(Number(id)) ? Number(id) : id;
        this.clienteId = !isNaN(Number(clienteId)) ? Number(clienteId) : clienteId;
        this.servicioId = !isNaN(Number(servicioId)) ? Number(servicioId) : servicioId;
        this.instructorId = !isNaN(Number(instructorId)) ? Number(instructorId) : instructorId;
        this.salaId = !isNaN(Number(salaId)) ? Number(salaId) : salaId;
        this.fechaHora = new Date(fechaHora).toISOString();
        this.estado = estado; // "reservado", "atendido", "cancelado"
        this.esSobreturno = Boolean(esSobreturno);
        this.motivoSobreturno = motivoSobreturno;
    }

    cancelar() {
        this.estado = "cancelado";
    }

    atender() {
        this.estado = "atendido";
    }
}

module.exports = Turno;