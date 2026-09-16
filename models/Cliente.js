class Cliente {
    constructor(id, nombre, apellido, dni, email, telefono) {
        this.id = !isNaN(Number(id)) ? Number(id) : id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.email = email;
        this.telefono = telefono;
    }
}
module.exports = Cliente;