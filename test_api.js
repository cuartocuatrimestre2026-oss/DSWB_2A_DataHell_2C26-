// Script de verificación automatizada de endpoints y reglas de negocio para TurnoFlex
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('=====================================================');
    console.log('🧪 INICIANDO BATERÍA DE PRUEBAS AUTOMÁTICAS TURNOFLEX');
    console.log('=====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(name, condition, actual) {
        if (condition) {
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} -> Obtenido:`, actual);
            failed++;
        }
    }

    try {
        // Test 1: Home View Pug
        const resHome = await makeRequest('GET', '/');
        assert('GET / (Vista Home en Pug)', resHome.status === 200 && typeof resHome.body === 'string' && resHome.body.includes('Espacio Sideral'), resHome.status);

        // Test 2: Clientes View Pug
        const resVistaClientes = await makeRequest('GET', '/vista/clientes');
        assert('GET /vista/clientes (Padrón Socios en Pug)', resVistaClientes.status === 200 && resVistaClientes.body.includes('Padrón General'), resVistaClientes.status);

        // Test 3: Turnos View Pug
        const resVistaTurnos = await makeRequest('GET', '/vista/turnos');
        assert('GET /vista/turnos (Grilla Turnos en Pug)', resVistaTurnos.status === 200 && resVistaTurnos.body.includes('Grilla Operativa'), resVistaTurnos.status);

        // Test 4: Endpoints Base (Salas, Servicios, Instructores, Clientes)
        const resSalas = await makeRequest('GET', '/salas');
        assert('GET /salas (Catálogo de salas)', resSalas.status === 200 && Array.isArray(resSalas.body), resSalas.status);

        const resServicios = await makeRequest('GET', '/servicios');
        assert('GET /servicios (Catálogo de disciplinas)', resServicios.status === 200 && Array.isArray(resServicios.body), resServicios.status);

        const resInstructores = await makeRequest('GET', '/instructores');
        assert('GET /instructores (Padrón docente)', resInstructores.status === 200 && Array.isArray(resInstructores.body), resInstructores.status);

        const resClientes = await makeRequest('GET', '/clientes');
        assert('GET /clientes (Padrón de socios)', resClientes.status === 200 && Array.isArray(resClientes.body), resClientes.status);

        // CASO 1: Alta regular exitosa
        const fechaPrueba = new Date(Date.now() + 86400000).toISOString(); // Mañana
        const caso1 = await makeRequest('POST', '/turnos', {
            clienteId: 1,
            servicioId: 1,
            instructorId: 1,
            salaId: 1,
            fechaHora: fechaPrueba
        });
        assert('CASO 1: Alta Exitosa de Turno Regular (Status 201)', caso1.status === 201 && caso1.body.turno && !caso1.body.turno.esSobreturno, caso1.status);
        const idTurnoRegular = caso1.body.turno ? caso1.body.turno.id : null;

        // CASO 2: Rechazo por superposición horaria de instructor
        const caso2 = await makeRequest('POST', '/turnos', {
            clienteId: 2,
            servicioId: 1,
            instructorId: 1, // Mismo instructor a la misma hora
            salaId: 1,
            fechaHora: fechaPrueba
        });
        assert('CASO 2: Rechazo por Superposición Horaria de Instructor (Status 409)', caso2.status === 409 && caso2.body.error === "Conflicto", caso2.status);

        // CASO 3: Consulta de turnos por cliente
        const caso3 = await makeRequest('GET', `/turnos/cliente/1`);
        assert('CASO 3: Consulta Dinámica de Turnos por Cliente (Status 200)', caso3.status === 200 && Array.isArray(caso3.body) && caso3.body.length > 0, caso3.status);

        // CASO 4: Alta exitosa de sobreturno
        const caso4 = await makeRequest('POST', '/turnos/sobreturno', {
            clienteId: 2,
            servicioId: 1,
            instructorId: 2, // Distinto instructor para no colisionar
            salaId: 1,
            fechaHora: fechaPrueba,
            motivo: "Recuperación de sesión médica indicada por traumatología"
        });
        assert('CASO 4: Alta Exitosa de Sobreturno de Recepción (Status 201)', caso4.status === 201 && caso4.body.turno && caso4.body.turno.esSobreturno, caso4.status);
        const idSobreturno = caso4.body.turno ? caso4.body.turno.id : null;

        // CASO 5: Rechazo de sobreturno por ausencia de motivo
        const caso5 = await makeRequest('POST', '/turnos/sobreturno', {
            clienteId: 2,
            servicioId: 1,
            instructorId: 2,
            salaId: 1,
            fechaHora: fechaPrueba,
            motivo: ""
        });
        assert('CASO 5: Rechazo de Sobreturno por Ausencia de Motivo (Status 400)', caso5.status === 400 && caso5.body.error === "Validación fallida", caso5.status);

        // Test adicional: Transición de estado con POO (PUT /turnos/:id)
        if (idTurnoRegular) {
            const resPut = await makeRequest('PUT', `/turnos/${idTurnoRegular}`, { estado: 'atendido' });
            assert('PUT /turnos/:id (Transición a atendido con método POO)', resPut.status === 200 && resPut.body.turno.estado === 'atendido', resPut.status);
        }

        // Test adicional: Cancelar turno (DELETE /turnos/:id)
        if (idSobreturno) {
            const resDel = await makeRequest('DELETE', `/turnos/${idSobreturno}`);
            assert('DELETE /turnos/:id (Cancelación y liberación de cupo)', resDel.status === 200 && resDel.body.turno.estado === 'cancelado', resDel.status);
        }

    } catch (err) {
        console.error('💥 Error inesperado durante la ejecución de pruebas:', err.message);
        failed++;
    }

    console.log('\n=====================================================');
    console.log(`📊 RESULTADOS: ${passed} pasadas | ${failed} fallidas`);
    console.log('=====================================================\n');
}

runTests();
