const fs = require('fs/promises');
const path = require('path');

class JsonRepository {
    constructor(fileName) {
        this.filePath = path.join(__dirname, '..', 'data', fileName);
    }

    async leerTodos() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data || '[]');
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.guardarTodos([]);
                return [];
            }
            throw new Error(`Error al leer archivo ${this.filePath}: ${error.message}`);
        }
    }

    async guardarTodos(datos) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(datos, null, 2), 'utf-8');
        } catch (error) {
            throw new Error(`Error al escribir archivo ${this.filePath}: ${error.message}`);
        }
    }

    // Calcula de forma segura el siguiente ID entero autoincremental (1, 2, 3...)
    async obtenerSiguienteId() {
        const elementos = await this.leerTodos();
        if (!elementos || elementos.length === 0) return 1;
        const idsNumericos = elementos
            .map(item => Number(item.id))
            .filter(n => !isNaN(n) && n > 0);
        return idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;
    }

    async buscarPorId(id) {
        const elementos = await this.leerTodos();
        return elementos.find(item => String(item.id) === String(id) || Number(item.id) === Number(id)) || null;
    }

    async crear(nuevoElemento) {
        const elementos = await this.leerTodos();
        if (nuevoElemento.id === undefined || nuevoElemento.id === null) {
            nuevoElemento.id = await this.obtenerSiguienteId();
        } else {
            nuevoElemento.id = !isNaN(Number(nuevoElemento.id)) ? Number(nuevoElemento.id) : nuevoElemento.id;
        }
        elementos.push(nuevoElemento);
        await this.guardarTodos(elementos);
        return nuevoElemento;
    }

    async actualizar(id, datosActualizados) {
        const elementos = await this.leerTodos();
        const indice = elementos.findIndex(item => String(item.id) === String(id) || Number(item.id) === Number(id));
        if (indice === -1) return null;

        const idFinal = !isNaN(Number(id)) ? Number(id) : id;
        elementos[indice] = { ...elementos[indice], ...datosActualizados, id: idFinal };
        await this.guardarTodos(elementos);
        return elementos[indice];
    }

    async eliminar(id) {
        const elementos = await this.leerTodos();
        const indice = elementos.findIndex(item => String(item.id) === String(id) || Number(item.id) === Number(id));
        if (indice === -1) return false;

        elementos.splice(indice, 1);
        await this.guardarTodos(elementos);
        return true;
    }
}

module.exports = JsonRepository;