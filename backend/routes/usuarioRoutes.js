// routes/usuarioRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');


// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const guardarImagenBase64 = async (req, _res, next) => {
  // después de multer, req.body SIEMPRE existe (aunque sea objeto vacío)
  if (!req.body.imagenBase64) return next();

  try {
    console.log('🧾 Imagen base64 recibida:',
                req.body.imagenBase64.slice(0, 30));

    // 1. Limpiamos cabecera data:image/xxx;base64,
    const base64Data = req.body.imagenBase64
                        .replace(/^data:image\/\w+;base64,/, '');

    // 2. Buffer
    const buffer   = Buffer.from(base64Data, 'base64');

    // 3. Nombre único
    const filename = `usercam_${uuidv4()}.jpg`;

    // 4. Escribimos en disco
    await fs.promises.writeFile(
      path.join(__dirname, '../../uploads', filename),
      buffer
    );

    // 5. Pasamos el nombre al controller
    req.body.imagenCamara = filename;
    next();

  } catch (err) {
    console.error('Error guardando imagen de cámara:', err);
    next(err);
  }
};

// CRUD de usuarios

// GET: Obtener todos los usuarios
router.get('/', usuarioController.obtenerUsuarios);

// POST: Agregar un nuevo usuario (con imagen opcional)
router.post('/', upload.single('imagen_perfil'), guardarImagenBase64, usuarioController.agregarUsuario);


// PUT: Editar un usuario
router.put('/:id', usuarioController.editarUsuario);

// DELETE: Eliminar un usuario
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
