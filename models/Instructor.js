class Instructor {
    constructor(id, nombre, apellido, especialidad, email) {
        this.id = !isNaN(Number(id)) ? Number(id) : id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.especialidad = especialidad;
        this.email = email;
    }
}
module.exports = Instructor;