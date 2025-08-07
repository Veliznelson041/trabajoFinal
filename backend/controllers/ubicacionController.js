const db = require('../db');

exports.getProvincias = async (req, res) => {
  try {
    const [provincias] = await db.query('SELECT id, nombre FROM provincias');
    res.json(provincias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener provincias' });
  }
};

exports.getDepartamentos = async (req, res) => {
  const provinciaId = parseInt(req.query.provinciaId); // Convertir a número
  if (isNaN(provinciaId)) {
    return res.status(400).json({ error: 'ID de provincia inválido' });
  }
  try {
    // Consulta simplificada
    const [departamentos] = await db.query(
      'SELECT id, nombre FROM departamentos WHERE provincia_id = ?',
      [provinciaId]
    );
    res.json(departamentos);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ error: 'Error al obtener departamentos' });
  }
};

exports.getMunicipios = async (req, res) => {
  //const departamentoId = req.query.departamentoId;
  const departamentoId = parseInt(req.query.departamentoId); // Convertir a número
  if (isNaN(departamentoId)) {
    return res.status(400).json({ error: 'ID de departamento inválido' });
  }
  try {
    // Consulta simplificada
    const [municipios] = await db.query(
      'SELECT id, nombre FROM municipios WHERE departamento_id = ?',
      [departamentoId]
    );
    res.json(municipios);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ error: 'Error al obtener municipios' });
  }
};

exports.getLocalidades = async (req, res) => {
  //const municipioId = req.query.municipioId;
  const municipioId = parseInt(req.query.municipioId); // Convertir a número
  if (isNaN(municipioId)) {
    return res.status(400).json({ error: 'ID de provincia inválido' });
  }
  try {
    // Consulta simplificada
    const [localidades] = await db.query(
      'SELECT id, nombre FROM localidades WHERE municipio_id = ?',
      [municipioId]
    );
    res.json(localidades);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ error: 'Error al obtener localidades' });
  }
};