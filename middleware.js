// middleware.js

const jwt = require('jsonwebtoken');
const { secretKey } = require('./src/controllers/loginController'); // Asegúrate de importar tu clave secreta desde un lugar seguro

function verificarAutenticacion(req, res, next) {
    // Verifica si la cabecera de autorización está presente
    const headerAuthorization = req.headers.authorization;

    if (!headerAuthorization || !headerAuthorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    }

    // Extrae el token de la cabecera de autorización
    const token = headerAuthorization.slice(7);

    try {
        // Verifica el token
        const decodedToken = jwt.verify(token, secretKey);

        // Agrega la información del usuario decodificada al objeto de solicitud para su uso en las rutas posteriores
        req.user = decodedToken;  // Cambiado de req.usuario a req.user

        console.log('Usuario autenticado:', req.user)

        // Pasa al siguiente middleware o controlador de ruta
        next();
    } catch (error) {
        console.error('Error en verificarAutenticacion:', error.message);
        res.status(401).json({ error: 'Token no válido o expirado.' });
    }
}

module.exports = { verificarAutenticacion };
