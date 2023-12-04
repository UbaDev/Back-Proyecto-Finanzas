var admin = require("firebase-admin");

var serviceAccount = require("../../path.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://finanzas-b0da3-default-rtdb.firebaseio.com"
});

var db = admin.firestore();

module.exports = { db };


