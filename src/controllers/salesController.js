
const { db } = require("../db/firebase.js");

async function uploadCard(req, res) {
  try {
    const { nombre, numero, fecha, numeroSeguridad, saldo } = req.body;

    if (!nombre || !numero || !fecha || !numeroSeguridad || !saldo) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    const newCardRef = await db.collection("sales").add({
      nombre,
      numero,
      fecha,
      numeroSeguridad,
      saldo,
      userId: req.user.userId, 
    });

    console.log("Tarjeta subida con éxito:", newCardRef.id);

    res.status(201).json({ message: "Su tarjeta fue registrada correctamente a la aplicación" });
  } catch (error) {
    console.error("Error en uploadCard:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

async function deleteCard(req, res) {
    try {
        const cardId = req.params.cardId;

        if (!cardId) {
            return res.status(400).json({ error: 'ID de tarjeta no proporcionado.' });
        }

        const cardDoc = await db.collection('sales').doc(cardId).get();

        if (!cardDoc.exists || cardDoc.data().userId !== req.user.userId) {
            return res.status(403).json({ error: 'No tienes permisos para borrar esta tarjeta.' });
        }

        await db.collection('sales').doc(cardId).delete();

        console.log('Tarjeta borrada con éxito:', cardId);

        res.status(200).json({ message: 'La tarjeta fue borrada  con éxito de la aplicación' });
    } catch (error) {
        console.error('Error en deleteCard:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

async function uploadTransaction(req, res) {
  try {
    const { nombre, fecha, estatus, saldoAPagar } = req.body;

    if (!nombre || !fecha || !estatus || !saldoAPagar) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    const newTransactionRef = await db.collection("transactions").add({
      nombre,
      fecha,
      estatus,  
      saldoAPagar,
      userId: req.user.userId, 
    });

    console.log("Movimiento subido con éxito:", newTransactionRef.id);

    res.status(201).json({ message: "Movimiento registrado con éxito." });
  } catch (error) {
    console.error("Error en uploadTransaction:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

async function getTransactions(req, res) {
  try {
    // Verificar la autenticación del usuario
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    // Obtener los movimientos asociados al usuario
    const userId = req.user.userId;
    const transactionsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .get();

    const transactions = [];

    // Recorrer los resultados y construir un array de movimientos
    transactionsSnapshot.forEach((doc) => {
      const transactionData = doc.data();
      transactions.push({
        id: doc.id,
        nombre: transactionData.nombre,
        fecha: transactionData.fecha,
        estatus: transactionData.estatus,
        saldoAPagar: transactionData.saldoAPagar,
      });
    });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error en getTransactions:", error.message);
    res
      .status(500)
      .json({
        error: "Error interno del servidor.",
        originalError: error.message,
      });
  }
}

async function getGraficaData(req, res) {
  try {
    // Obtener la referencia a la colección del usuario
    const userCollection = db
      .collection("users")
      .doc(req.params.userId)
      .collection("grafica");

    // Obtener todos los documentos de la colección del usuario
    const graficaSnapshot = await userCollection.get();

    // Mapear los documentos a un array de objetos
    const graficaData = graficaSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        name: data.fecha.toDate().toLocaleDateString(),
        pv: data.saldoAPagar,
      };
    });

    res.status(200).json(graficaData);
  } catch (error) {
    console.error("Error en getGraficaData:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}



async function updateCardBalance(req, res) {
  try {
    const cardId = req.params.cardId;
    const { nuevoSaldo } = req.body;

    if (!cardId || !nuevoSaldo) {
      return res
        .status(400)
        .json({ error: "ID de tarjeta y nuevo saldo son obligatorios." });
    }

    const cardDoc = await db.collection("sales").doc(cardId).get();

    if (!cardDoc.exists || cardDoc.data().userId !== req.user.userId) {
      return res
        .status(403)
        .json({
          error: "No tienes permisos para actualizar el saldo de esta tarjeta.",
        });
    }

    await db.collection("sales").doc(cardId).update({
      saldo: nuevoSaldo,
    });

    console.log("Saldo de la tarjeta actualizado con éxito:", cardId);

    res
      .status(200)
      .json({ message: "Saldo de la tarjeta actualizado con éxito." });
  } catch (error) {
    console.error("Error en updateCardBalance:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

async function getCardByUser(req, res) {
  try {
    const userId = req.user.userId; 

    if (!userId) {
      return res.status(400).json({ error: "ID de usuario no proporcionado." });
    }

    const cardsSnapshot = await db
      .collection("sales")
      .where("userId", "==", userId)
      .get();

    const cards = [];
    cardsSnapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({ cards });
  } catch (error) {
    console.error("Error en getCardsByUser:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

async function getLatestTransaction(req, res) {
  try {
    // Verificar la autenticación del usuario
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    // Obtener el movimiento más reciente asociado al usuario
    const userId = req.user.userId;
    const transactionsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .limit(1) // Limitar a un resultado (el más reciente)
      .get();

    // Verificar si se encontraron resultados
    if (transactionsSnapshot.empty) {
      return res.status(404).json({ error: "No se encontraron movimientos." });
    }

    // Obtener el primer (y único) resultado
    const latestTransaction = transactionsSnapshot.docs[0].data();

    res.status(200).json({ latestTransaction });
  } catch (error) {
    console.error("Error en getLatestTransaction:", error.message);
    res.status(500).json({
      error: "Error interno del servidor.",
      originalError: error.message,
    });
  }
}

async function deleteTransaction(req, res) {
  try {
    const transactionId = req.params.transactionId;

    if (!transactionId) {
      return res
        .status(400)
        .json({ error: "Se requiere proporcionar el ID de la transacción." });
    }

    // Verificar si la transacción existe antes de intentar eliminarla
    const transactionDoc = await db
      .collection("transactions")
      .doc(transactionId)
      .get();

    if (!transactionDoc.exists) {
      return res.status(404).json({ error: "La transacción no existe." });
    }

    // Eliminar la transacción
    await db.collection("transactions").doc(transactionId).delete();

    console.log("Transacción eliminada con éxito:", transactionId);

    res.status(200).json({ message: "Transacción eliminada con éxito." });
  } catch (error) {
    console.error("Error en deleteTransaction:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

async function payTransaction(req, res) {
  try {
    const { cardId, transactionId } = req.params;

    if (!cardId || !transactionId) {
      return res
        .status(400)
        .json({
          error:
            "Se requiere proporcionar el ID de la tarjeta y el ID de la transacción.",
        });
    }

    // Obtener la información de la transacción
    const transactionDoc = await db
      .collection("transactions")
      .doc(transactionId)
      .get();

    if (!transactionDoc.exists) {
      return res.status(404).json({ error: "La transacción no existe." });
    }

    const transactionData = transactionDoc.data();
    const { saldoAPagar } = transactionData;

    // Obtener la información de la venta/sale
    const saleDoc = await db.collection("sales").doc(cardId).get();

    if (!saleDoc.exists) {
      return res
        .status(404)
        .json({ error: "No se encontró la información de la venta." });
    }

    const saleData = saleDoc.data();
    let { saldo } = saleData;

    // Validar que haya saldo suficiente
    if (saldo < saldoAPagar) {
      return res
        .status(400)
        .json({ error: "Saldo insuficiente para pagar la transacción." });
    }

    // Actualizar el saldo en la venta/sale
    saldo -= saldoAPagar;
    await db.collection("sales").doc(cardId).update({ saldo });

    // Actualizar la transacción
    await db.collection("transactions").doc(transactionId).update({
      estatus: "Pagado",
    });

   const graficaData = {
     saldoAPagar,
     fecha: new Date(),
     userId: req.user.userId,
   };

   // Crear una referencia a la colección del usuario
   const userCollection = db
     .collection("users")
     .doc(req.user.userId)
     .collection("grafica");

   await userCollection.add(graficaData);

    console.log("Transacción pagada con éxito:", transactionId);

    res.status(200).json({ message: "Transacción pagada con éxito." });
  } catch (error) {
    console.error("Error en payTransaction:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}


// Backend (Node.js/Express)
async function getUserData(req, res) {
  try {
    // Verificar la autenticación del usuario
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    const userId = req.user.userId;

    // Obtener datos del usuario por ID
    const userDoc = await db.collection("users").doc(userId).get();

    // Verificar si el usuario existe
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Obtener datos del documento del usuario
    const userData = userDoc.data();

    // Devolver más datos del usuario, ajusta según tus necesidades
    res.status(200).json({
      userId: userId,
      displayName: userData.displayName,
      email: userData.email,
      // Agrega otros campos según sea necesario
    });
  } catch (error) {
    console.error("Error en getUserData:", error.message);
    res.status(500).json({
      error: "Error interno del servidor.",
      originalError: error.message,
    });
  }
}




module.exports = {
  uploadCard,
  deleteCard,
  uploadTransaction,
  updateCardBalance,
  getCardByUser,
  getTransactions,
  getLatestTransaction,
  deleteTransaction,
  getGraficaData,
  payTransaction,
  getUserData,
};
