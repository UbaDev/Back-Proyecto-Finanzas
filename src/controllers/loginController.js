// loginController.mjs
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db/firebase.js');

const saltRounds = 10;

const secretKey = 'cascasdc897cd8a7scd8.r23r.r.32r,23.r23r.,';


async function register(req, res) {
    try {
        console.log('Body de la solicitud:', req.body);

        if (!req.body || !req.body.email || !req.body.displayName || !req.body.password) {
            throw new Error('Cuerpo de solicitud no válido');
        }

        const email = req.body.email;
        const displayName = req.body.displayName;
        const password = req.body.password;

        if (password.length < 6 || !/\d/.test(password)) {
            throw new Error('La contraseña debe tener al menos 6 caracteres y contener al menos un número.');
        }

        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.where('email', '==', email).get();

        if (!existingUser.empty) {
            throw new Error('El correo electrónico ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userData = {
            email: email,
            displayName: displayName,
            password: hashedPassword,
        };

        const result = await usersCollection.add(userData);

        res.status(200).json({ message: 'Usuario registrado correctamente', userId: result.id });
    } catch (error) {
        console.error('Error en register:', error.message);
        res.status(400).json({ error: error.message });
    }
}


async function login(req, res) {
    try {
        console.log('Body de la solicitud:', req.body);

        if (!req.body || !req.body.email || !req.body.password) {
            throw new Error('Cuerpo de solicitud no válido');
        }

        const email = req.body.email;
        const password = req.body.password;

        // Obtener usuario por correo electrónico desde Firestore
        const usersCollection = db.collection('users');
        const userSnapshot = await usersCollection.where('email', '==', email).get();

        if (userSnapshot.empty) {
            throw new Error('Usuario no encontrado');
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Comparar la contraseña proporcionada con la contraseña almacenada
        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (!passwordMatch) {
            throw new Error('Contraseña incorrecta');
        }

        const token = jwt.sign({ userId: userDoc.id, email: userData.email }, secretKey, { expiresIn: '24h' });
        console.log('Token generado:', token);

        // Devolver token en la respuesta
        res.status(200).json({ message: 'Inicio de sesión exitoso', token: token });
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(401).json({ error: error.message });
    }
}

module.exports = { register, login, secretKey };
