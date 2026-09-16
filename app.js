const express = require('express');
const path = require('path');

const loggerMiddleware = require('./middlewares/loggerMiddleware');
const manejoErroresMiddleware = require('./middlewares/manejoErroresMiddleware');

// Importación de rutas de la API REST
const turnosRoutes = require('./routes/turnos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const instructoresRoutes = require('./routes/instructores.routes');
const salasRoutes = require('./routes/salas.routes');

// Repositorios JSON para renderizado de vistas
const JsonRepository = require('./models/JsonRepository');
const turnosRepo = new JsonRepository('turnos.json');
const clientesRepo = new JsonRepository('clientes.json');
const salasRepo = new JsonRepository('salas.json');
const serviciosRepo = new JsonRepository('servicios.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Configuración de recursos estáticos y motor de plantillas Pug
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Registro de endpoints API-REST
app.use('/turnos', turnosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/instructores', instructoresRoutes);
app.use('/salas', salasRoutes);

// Vistas Server-Side renderizadas con Pug (Consola interna de recepción)
app.get('/', async (req, res, next) => {
    try {
        const [turnos, clientes, salas, servicios] = await Promise.all([
            turnosRepo.leerTodos(),
            clientesRepo.leerTodos(),
            salasRepo.leerTodos(),
            serviciosRepo.leerTodos()
        ]);
        res.render('index', {
            totalTurnos: turnos.length,
            totalClientes: clientes.length,
            totalSalas: salas.length,
            totalServicios: servicios.length
        });
    } catch (error) {
        next(error);
    }
});

app.get('/vista/turnos', async (req, res, next) => {
    try {
        const turnos = await turnosRepo.leerTodos();
        res.render('turnos', { turnos });
    } catch (error) {
        next(error);
    }
});

app.get('/vista/clientes', async (req, res, next) => {
    try {
        const clientes = await clientesRepo.leerTodos();
        res.render('clientes', { clientes });
    } catch (error) {
        next(error);
    }
});

// Manejo de ruta no encontrada (404)
app.use((req, res) => {
    if (req.accepts('html')) {
        return res.status(404).render('error', {
            status: 404,
            mensaje: "Recurso no encontrado",
            detalle: `La ruta solicitada '${req.originalUrl}' no existe en el servidor.`
        });
    }
    res.status(404).json({
        error: "Ruta no encontrada",
        detalle: `El endpoint '${req.originalUrl}' no existe.`
    });
});

// Middleware centralizado de manejo de errores
app.use(manejoErroresMiddleware);

app.listen(PORT, () => {
    console.log(`Servidor TurnoFlex iniciado correctamente en http://localhost:${PORT}`);
});