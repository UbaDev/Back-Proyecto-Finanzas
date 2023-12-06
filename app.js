const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const mainRoutes = require('./src/routes/mainRoutes.js');
const path = require('path'); 

const app = express();
const PORT = 3000;


const corsOptions = {
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(mainRoutes);

// Sirve los archivos estáticos de React desde la carpeta 'build'
app.use(express.static(path.join(__dirname, 'build')));

// Ruta principal que sirve el archivo HTML de React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});


