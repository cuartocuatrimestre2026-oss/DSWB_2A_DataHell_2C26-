function manejoErroresMiddleware(err, req, res, next) {
    console.error(`Error no controlado: ${err.message}`);
    const status = err.status || 500;
    res.status(status).json({
        error: "Error interno del servidor",
        detalle: err.message || "Ocurrió una falla imprevista en el backend."
    });
}

module.exports = manejoErroresMiddleware;