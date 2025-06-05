const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');
const multer = require('multer');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Rutas CRUD para personas
router.get('/', personaController.obtenerPersonas);
router.post('/', upload.single('imagen'), personaController.registrarPersona);
router.put('/:id', personaController.editarPersona);
router.delete('/:id', personaController.eliminarPersona);

module.exports = router;
