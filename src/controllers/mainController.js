const { db } = require('../db/firebase.js');


const getIndex = async (req, res) => {
    try {
        // Accede a la colección "users" en Firestore
        const usersCollection = db.collection('users');

        // Realiza cualquier operación que necesites con la colección "users"
        // Por ejemplo, obtener todos los documentos en la colección
        const querySnapshot = await usersCollection.get();

        // Itera sobre los documentos y haz algo con ellos (en este caso, solo los imprime)
        querySnapshot.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data());
        });

        // Envía una respuesta adecuada al cliente
        res.status(200).json({ message: 'Operación exitosa' });
    } catch (error) {
        // Maneja errores y envía una respuesta de error al cliente
        console.error('Error en getIndex:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const uploadSales = async (req, res) => {
    try {
        const userId = req.user ? req.user.uid : null;
        console.log('userId:', userId)

        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        
        if (!userId || userId.trim() === '') {
            return res.status(401).json({ error: 'ID de usuario no válido.' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }

        const { cardName, cardNumber, cardExpiry, cardCvc, cardBalance } = req.body;

        const cardDetails = {
            cardName,
            cardNumber,
            cardExpiry,
            cardCvc,
            cardBalance,
        };

        await db.collection('users').doc(userId).collection('tarjetas').add(cardDetails);

        res.status(200).json({ success: true, message: 'Tarjeta agregada correctamente' });
    } catch (error) {
        console.error('Error al agregar la tarjeta:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = { getIndex, uploadSales };

