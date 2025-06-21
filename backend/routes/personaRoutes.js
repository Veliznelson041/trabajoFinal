const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const fsp = fs.promises;

function getTimeStamp() {
  const now = new Date();
  const offset = -3;
  const argentina = new Date(now.getTime() + offset * 60 * 60 * 1000);  
  return argentina.toISOString()
    .replace(/[:.-]/g, '')
    .replace('T', '')
    .slice(0, 14); 
}

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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB límite inicial
});

const processImage = async (req, res, next) => {
  if (!req.file) return next();
  
  req.file.limpiarArchivos = [req.file.path];
  
  try {
    const inputPath = req.file.path;
    const originalExt = path.extname(inputPath).toLowerCase();
    const isSVG = originalExt === '.svg';
    
    const timeStamp = getTimeStamp();
    const dni = req.body.dni;
    const entidad = 'persona';
    const newFilename = `${entidad}_${dni}_${timeStamp}${isSVG ? '.svg' : '.webp'}`;
    const newPath = path.join(path.dirname(inputPath), newFilename);

    if (!isSVG) {
      const outputPath = path.join(
        path.dirname(inputPath),
        `${path.basename(inputPath, path.extname(inputPath))}.webp`
      );
      
      await sharp(inputPath)
        .resize(250, 250, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 80, reductionEffort: 6 })
        .toFile(outputPath);

      await fsp.unlink(inputPath);
      await fsp.rename(outputPath, newPath);
      req.file.limpiarArchivos.push(outputPath);
    } else {
      await fsp.rename(inputPath, newPath);
    }

    req.file.limpiarArchivos.push(newPath);
    req.file.filename = newFilename;
    next();
  } catch (error) {
    console.error('Error procesando imagen:', error.message);
    
    await personaController.limpiarArchivos(req.file.limpiarArchivos);
    next(error);
  }
};

const limpiarArchivos = async (filePaths) => {
  if (!filePaths) return;
  
  for (const filePath of filePaths) {
    try {
      await fsp.access(filePath);
      await fsp.unlink(filePath);
      console.log(`Archivo limpiado: ${filePath}`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('Error limpiando archivo:', err.message);
      }
    }
  }
};

// Rutas CRUD para personas
router.get('/:id/imagen', personaController.obtenerImagenPersona);
router.get('/', personaController.obtenerPersonas);
router.post('/', upload.single('imagen'), processImage, personaController.registrarPersona);
router.put('/:id', upload.single('imagen'), processImage, personaController.editarPersona);
router.delete('/:id', personaController.eliminarPersona);

module.exports = router;
