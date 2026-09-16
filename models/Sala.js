class Sala {
    constructor(id, nombre, capacidadNormal) {
        this.id = !isNaN(Number(id)) ? Number(id) : id;
        this.nombre = nombre;
        this.capacidadNormal = Number(capacidadNormal);
    }

    calcularSobreturnosPermitidos() {
        return Math.floor(this.capacidadNormal * 0.15);
    }

    admiteSobreturno(sobreturnosActuales) {
        return sobreturnosActuales < this.calcularSobreturnosPermitidos();
    }
}

module.exports = Sala;