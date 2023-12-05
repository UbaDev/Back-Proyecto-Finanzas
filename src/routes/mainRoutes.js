// mainRoutes.js
const express = require("express");
const mainController = require("../controllers/mainController.js");
const loginController = require("../controllers/loginController.js");
const { verificarAutenticacion } = require("../../middleware.js");
const salesController = require("../controllers/salesController.js");

const router = express.Router();

router.get("/api/", verificarAutenticacion, mainController.getIndex);
router.post("/api/login", loginController.login);
router.post("/api/register", loginController.register);
router.post(
  "/api/uploadCard",
  verificarAutenticacion,
  salesController.uploadCard
);
router.delete(
  "/api/cards/:cardId",
  verificarAutenticacion,
  salesController.deleteCard
);
router.post(
  "/api/transactions",
  verificarAutenticacion,
  salesController.uploadTransaction
); 

router.put(
  "/api/cards/:cardId/update-balance",
  verificarAutenticacion,
  salesController.updateCardBalance
);

router.get(
  "/api/cards",
  verificarAutenticacion,
  salesController.getCardByUser
);

router.get("/api/obtain-transaction", verificarAutenticacion, salesController.getTransactions);

router.get(
  "/api/obtain-latest-transaction",
  verificarAutenticacion,
  salesController.getLatestTransaction
);

router.delete(
  "/api/transactions/:transactionId",
  verificarAutenticacion,
  salesController.deleteTransaction
);
router.put(
  "/api/cards/:cardId/transactions/:transactionId/pay",
  verificarAutenticacion,
  salesController.payTransaction
);

router.get(
  "/api/grafica/:userId",
  verificarAutenticacion,
  salesController.getGraficaData
);


router.get("/api/user", verificarAutenticacion, salesController.getUserData);





module.exports = router;
