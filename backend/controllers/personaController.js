const db = require('../db');

// POST - Registrar persona
exports.registrarPersona = async (req, res) => {
  const { nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento } = req.body;
  const imagen = req.file ? req.file.filename : 'default.jpg';

  try {
    const [result] = await db.execute(
      'INSERT INTO personas (nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, imagen]
    );
    res.status(201).json({ id: result.insertId, message: 'Persona registrada exitosamente.', imagen_url: `http://localhost:3000/uploads/${imagen}` });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'El DNI ya está registrado',
        campo: 'dni'
      });
    }
    res.status(500).json({ error: 'Error al registrar persona.', detalles: error.message });
  }
};

// GET - Obtener todas las personas
exports.obtenerPersonas = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM personas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener personas.', detalles: error.message});
  }
};

// PUT - Editar persona
exports.editarPersona = async (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE personas SET nombre = ?, apellido = ?, dni = ?, calle = ?, provincia = ?, departamento = ?, localidad = ?, genero = ?, fecha_nacimiento = ? WHERE id = ?',
      [nombres, apellidos, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, id]
    );
    res.json({ message: 'Persona actualizada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar persona.', detalles: error });
  }
};

// DELETE - Eliminar persona
exports.eliminarPersona = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM personas WHERE id = ?', [id]);
    res.json({ message: 'Persona eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar persona.', detalles: error });
  }
};
