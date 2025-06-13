const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

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

    // Procesar imagen solo si no es SVG
    if (path.extname(inputPath).toLowerCase() !== '.svg') {
      await sharp(inputPath)
        .resize(250, 250, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .webp({ quality: 80, reductionEffort: 6 }) // Ajustar calidad para ~450KB
        .toFile(outputPath);

      // Eliminar original y mantener el procesado
      fs.unlinkSync(inputPath);
      req.file.filename = path.basename(outputPath);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};


// Rutas CRUD para personas
router.get('/:id/imagen', personaController.obtenerImagenPersona);
router.get('/', personaController.obtenerPersonas);
router.post('/', upload.single('imagen'), processImage, personaController.registrarPersona);
router.put('/:id', personaController.editarPersona);
router.delete('/:id', personaController.eliminarPersona);

module.exports = router;
