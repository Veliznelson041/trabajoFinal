// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const multer = require('multer');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// CRUD de usuarios

// GET: Obtener todos los usuarios
router.get('/', usuarioController.obtenerUsuarios);

// POST: Agregar un nuevo usuario (con imagen opcional)
router.post('/', upload.single('imagen_perfil'), usuarioController.agregarUsuario);


// PUT: Editar un usuario
router.put('/:id', usuarioController.editarUsuario);

// DELETE: Eliminar un usuario
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
