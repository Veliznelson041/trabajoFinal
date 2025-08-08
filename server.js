require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./backend/db"); // conexión MySQL
const personaRoutes = require("./backend/routes/personaRoutes");
const usuarioRoutes = require("./backend/routes/usuarioRoutes"); // ✅ Solo una vez
const path = require('path');

const app = express();

// server.js
// ... (código existente)
const ubicacionRoutes = require('./backend/routes/ubicacionRoutes'); // Agregar

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5505'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', ubicacionRoutes); // Nueva línea
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static("html"));

//rama cris//

app.use('/css', express.static(path.join(__dirname, 'css')));

app.use(express.static(path.join(__dirname, 'loginHtml')));
//rama cris//

// Agregar esta línea después de los middlewares
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));


// Registrar rutas (AGREGAR ESTO)
//app.use('/api', ubicacionRoutes); // ¡Nueva línea!
// Rutas
app.use('/personas', personaRoutes);
// Si querés habilitar también la ruta de usuario, dejá esta línea:
app.use('/usuarios', usuarioRoutes);


// Levantar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
