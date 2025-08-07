require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./backend/db"); // conexión MySQL
const personaRoutes = require("./backend/routes/personaRoutes");
const exportarRoutes = require('./backend/routes/exportarRoutes'); 
const usuarioRoutes = require('./backend/routes/usuarioRoutes');
const path = require('path');

const app = express();

// server.js
// ... (código existente)
const ubicacionRoutes = require('./backend/routes/ubicacionRoutes'); // Agregar

// Middleware
app.use(cors({
   origin: 'http://localhost:3000', // O tu dominio real
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));

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
app.use('/api/usuarios', usuarioRoutes);
app.use('/', exportarRoutes); // ✅ Solo una vez

// Levantar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
