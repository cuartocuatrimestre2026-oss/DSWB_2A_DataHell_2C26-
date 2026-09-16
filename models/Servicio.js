class Servicio {
    constructor(id, nombre, modalidad, duracionMinutos, salaRequerida) {
        this.id = !isNaN(Number(id)) ? Number(id) : id;
        this.nombre = nombre;
        this.modalidad = modalidad;
        this.duracionMinutos = Number(duracionMinutos);
        this.salaRequerida = !isNaN(Number(salaRequerida)) ? Number(salaRequerida) : salaRequerida;
    }
}
module.exports = Servicio;