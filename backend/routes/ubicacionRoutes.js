// ubicacionRoutes.js
const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');

router.get('/provincias', ubicacionController.getProvincias);
router.get('/departamentos', ubicacionController.getDepartamentos);
router.get('/municipios', ubicacionController.getMunicipios);
router.get('/localidades', ubicacionController.getLocalidades);

module.exports = router;