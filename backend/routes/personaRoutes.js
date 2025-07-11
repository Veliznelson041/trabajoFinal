const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>{
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o SVG'), false);
  }
};


const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB límite inicial
});

// Middleware para procesar imágenes
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const inputPath = req.file.path;
    const outputPath = path.join(
      path.dirname(inputPath),
      path.basename(inputPath, path.extname(inputPath)) + '.webp'
    );

    // Solo procesar si no es SVG
    if (path.extname(inputPath).toLowerCase() !== '.svg') {
      await sharp(inputPath)
        .resize(250, 250, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .webp({ quality: 80, reductionEffort: 6 })
        .toFile(outputPath);

      // Intentar eliminar el archivo original de forma segura
      fs.unlink(inputPath, (err) => {
        if (err) {
          console.error('⚠️ No se pudo eliminar el archivo original:', err.message);
        } else {
          console.log('🗑️ Archivo original eliminado correctamente:', inputPath);
        }
      });

      req.file.filename = path.basename(outputPath);
    }

    next();
  } catch (error) {
    console.error('❌ Error procesando imagen:', error.message);
    next(error);
  }
};

const guardarImagenBase64 = async (req, res, next) => {
  if (!req.body?.imagenBase64) return next();

  try {
    const base64 = req.body.imagenBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    const filename = `cam_${uuidv4()}.jpg`;
    await fs.promises.writeFile(path.join(__dirname, '../../uploads', filename), buffer);
    req.body.imagenCamara = filename;   // lo usará el controller
    next();
  } catch (err) {
    console.error('Error al guardar imagen cámara:', err);
    return res.status(500).json({ error: 'No se pudo guardar la foto' });
  }
};



// Rutas CRUD para personas
router.get('/:id/imagen', personaController.obtenerImagenPersona);
router.get('/', personaController.obtenerPersonas);
router.post('/', upload.single('imagen'), guardarImagenBase64, processImage, personaController.registrarPersona);
router.put('/:id', personaController.editarPersona);
router.delete('/:id', personaController.eliminarPersona);

module.exports = router;
