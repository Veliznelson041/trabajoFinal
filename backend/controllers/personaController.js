const db = require('../db');
const path = require('path');
const fs = require('fs');

// Eliminar imagen física si es necesario
const deleteImageFile = (filename) => {
  if (filename && filename !== 'default.jpg') {
    const filePath = path.join(__dirname, '../uploads', filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error al eliminar la imagen:', unlinkErr.message);
          } else {
            console.log('Imagen eliminada correctamente.');
          }
        });
      }
    });
  }
};

exports.obtenerImagenPersona = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [req.params.id]);

    if (!rows.length || !rows[0].imagen) {
      return res.status(404).send('Imagen no encontrada');
    }

    const imagePath = path.join(__dirname, '../../uploads', rows[0].imagen);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('Archivo de imagen no encontrado');
    }

    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({ error: 'Error al obtener imagen' });
  }
};

exports.registrarPersona = async (req, res) => {
  const { nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, latitud, longitud } = req.body;
  const imagen = req.file ? req.file.filename : 'default.jpg';
  const imagenCamara = req.body.imagenCamara || null;

  try {
    const [resultado] = await db.execute(
      'INSERT INTO personas (nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, imagen, imagenCamara, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, imagen, imagenCamara, latitud || null, longitud || null]
    );

    console.log("✅ Persona registrada en la base de datos.");

    if (req.file && req.body.oldImage && req.body.oldImage !== 'default.jpg') {
      deleteImageFile(req.body.oldImage);
    }

    res.status(201).json({
      id: resultado.insertId,
      message: 'Persona registrada exitosamente.',
      imagen_url: `http://localhost:3000/uploads/${imagen}`
    });
  } catch (error) {
    if (req.file) deleteImageFile(req.file.filename);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'El DNI ya está registrado',
        campo: 'dni'
      });
    }

    console.error("❌ Error al registrar persona:", error.message);
    res.status(500).json({
      error: 'Error al registrar persona.',
      detalles: error.message
    });
  }
};



exports.obtenerPersonas = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM personas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener personas.', detalles: error.message });
  }
};


exports.editarPersona = async (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, latitud, longitud } = req.body;

  try {
    const [current] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [id]);
    const oldFilename = current[0]?.imagen;

    await db.execute(
      'UPDATE personas SET nombre = ?, apellido = ?, dni = ?, calle = ?, provincia = ?, departamento = ?, localidad = ?, genero = ?, fecha_nacimiento = ?, latitud = ?, longitud = ? WHERE id = ?',
      [nombres, apellidos, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, parseFloat(latitud) || null, parseFloat(longitud) || null, id]
    );

    if (req.file && oldFilename && oldFilename !== 'default.jpg') {
      deleteImageFile(oldFilename);
    }

    res.json({ mensaje: 'Persona actualizada correctamente.' });
  } catch (error) {
    if (req.file) deleteImageFile(req.file.filename);
    res.status(500).json({ error: 'Error al actualizar persona.', detalles: error.message });
  }
};

exports.eliminarPersona = async (req, res) => {
  const { id } = req.params;

  try {
    const [current] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [id]);
    const filename = current[0]?.imagen;

    await db.execute('DELETE FROM personas WHERE id = ?', [id]);

    if (filename && filename !== 'default.jpg') {
      deleteImageFile(filename);
    }

    res.json({ mensaje: 'Persona eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar persona.', detalles: error.message });
  }
};
