require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./backend/db"); // conexión MySQL
const personaRoutes = require("./backend/routes/personaRoutes");
const usuarioRoutes = require("./backend/routes/usuarioRoutes"); // ✅ Solo una vez
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static("html"));

// Rutas
app.use('/personas', personaRoutes);
// Si querés habilitar también la ruta de usuario, dejá esta línea:
app.use('/usuarios', usuarioRoutes);


// Levantar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
