# TurnoFlex - Sistema de Gestión de Turnos y Aforos
> **API RESTful y Consola Interna para Espacio Sideral S.A.S.**  
> **Trabajo Práctico N° 1 - Desarrollo Web Backend (IFTS N° 29 - 2C2026 - Comisión 2° A)**  
> **Empresa de Desarrollo: DataHell (Grupo 9)**


## Integrantes y Responsabilidades

* **Mariela Andrea Lorenzo:** Líder Técnico y Arquitectura Backend (Configuración de Express, patrón MVC, repositorio genérico `JsonRepository` y middleware global de excepciones).
* **Sonia Candela Pereira:** Desarrolladora de Dominio y POO (Clases de negocio `Turno`, `Sala`, `Cliente`, `Servicio`, `Instructor`, algoritmo de superposición horaria y cálculo matemático de sobreturnos al 15%).
* **Johana Micaela Navarro:** Desarrolladora de Rutas y Middlewares (Enrutadores modulares, rutas dinámicas `:id`, auditoría con `loggerMiddleware` y sanitización con `validarIdMiddleware`).
* **Sergio Alberto Arenhardt:** Desarrollador Frontend Pug & UI (Plantillas Pug `main.pug`, `index.pug`, `turnos.pug`, `clientes.pug`, `error.pug` y hoja de estilos responsive con distintivo visual para sobreturnos).
* **Elena Beatriz González:** Especialista en QA, Testing y Documentación (Diseño y ejecución de batería de pruebas en Thunder Client, verificación de códigos HTTP y articulación con Ingeniería de Software).


## Tecnologías y Arquitectura

* **Entorno de Ejecución:** Node.js (Motor V8, libuv).
* **Framework Web:** Express.js (v5.x).
* **Patrón de Diseño:** MVC (Modelo-Vista-Controlador) modular con punto de entrada único en `app.js`.
* **Nomenclatura de Archivos:** Notación por puntos (`*.controller.js` y `*.routes.js`).
* **Persistencia:** Simulación de base de datos NoSQL con archivos planos JSON en `/data/` y módulo asíncrono `fs/promises`.
* **Identificadores:** Claves primarias y foráneas numéricas autoincrementales puras (`1, 2, 3...`) gestionadas por `JsonRepository.obtenerSiguienteId()`.
* **Motor de Vistas:** Pug (renderizado en servidor con layouts compartidos).
* **Control de Aforos y Reglas de Negocio:** POO con métodos de dominio (`turno.atender()`, `turno.cancelar()`, `sala.calcularSobreturnosPermitidos()`).


## Puesta en Marcha (Instalación y Ejecución)

### 1. Clonar el repositorio
```bash
git clone https://github.com/[USUARIO]/turnoflex-backend.git
cd turnoflex-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor
```bash
# Modo producción
node app.js

# Modo desarrollo con recarga automática
npm run dev
```
El servidor quedará escuchando en: `http://localhost:3000`


## Navegación de la Consola Web (Pug)

* **Dashboard General:** `http://localhost:3000/`
* **Grilla Operativa de Turnos:** `http://localhost:3000/vista/turnos`
* **Padrón de Socios Habilitados:** `http://localhost:3000/vista/clientes`


## Catálogo de Endpoints de la API REST

### 1. Turnos (`/turnos`)
* `GET /turnos` - Listado general de turnos.
* `GET /turnos/:id` - Consulta de un turno puntual.
* `GET /turnos/cliente/:id` - Filtro de turnos por socio.
* `GET /turnos/instructor/:id` - Grilla horaria asignada a un docente.
* `POST /turnos` - Alta de turno regular (valida vacantes y colisiones).
* `POST /turnos/sobreturno` - Alta de sobreturno de recepción (exige motivo y tope del 15%).
* `PUT /turnos/:id` - Transición de estados (`reservado`, `atendido`, `cancelado`) vía POO.
* `DELETE /turnos/:id` - Cancelación y liberación automática de cupo.

### 2. Clientes / Socios (`/clientes`)
* `GET /clientes` | `GET /clientes/:id` | `POST /clientes` | `PUT /clientes/:id` | `DELETE /clientes/:id`

### 3. Salas y Aforos (`/salas`)
* `GET /salas` | `GET /salas/:id` | `POST /salas` | `PUT /salas/:id` | `DELETE /salas/:id`

### 4. Catálogo de Disciplinas (`/servicios`)
* `GET /servicios` | `GET /servicios/:id` | `POST /servicios` | `PUT /servicios/:id` | `DELETE /servicios/:id`

### 5. Padrón Docente (`/instructores`)
* `GET /instructores` | `GET /instructores/:id` | `POST /instructores` | `PUT /instructores/:id` | `DELETE /instructores/:id`


## Batería de Pruebas Automatizadas

El proyecto incluye un script con 14 pruebas de integración que validan códigos de estado (200, 201, 400, 404, 409):
```bash
node test_api.js
```
*(Resultado esperado: 14 pasadas | 0 fallidas)*

Además, se incluye el archivo `turnoflex_thunder_collection.json` con todos los casos de prueba para importar en Thunder Client de VS Code.


## Contexto Organizacional y Reglas de Negocio
Sistema modelado según el relevamiento de **Ingeniería de Software**:
* **RN03:** Bloqueo de solapamientos horarios en instructores y clientes.
* **RN04:** Aforo físico rígido por sala (Pilates: 10, Cardio: 20, SUM: 15, Gabinete: 1).
* **RN05 & RN06:** Sobreturno excepcional exclusivo de recepción (tope máximo del 15% con truncamiento entero y motivo obligatorio para auditoría).
