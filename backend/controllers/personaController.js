const db = require('../db');
const path = require('path');
const fs = require('fs');

// Función para eliminar archivos de imagen
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
    //  console.log(Solicitando imagen para ID: ${req.params.id});
    const [rows] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [req.params.id]);
    
    if (!rows.length || !rows[0].imagen) {
      //  console.log('No se encontró registro o imagen en la base de datos');
      return res.status(404).send('Imagen no encontrada');
    }

    console.log(`Nombre de archivo en DB: ${rows[0].imagen}`);

    const imagePath = path.join(__dirname, '../../uploads', rows[0].imagen);
      console.log(`Ruta completa del archivo: ${imagePath}`);
    
    // Verifica si el archivo existe antes de enviarlo
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('Archivo de imagen no encontrado');
    }
    
    console.log('Enviando archivo...');
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error detallado:', error); // error real
    res.status(500).json({ error: 'Error al obtener imagen' });
  }
};

// POST - Registrar persona
exports.registrarPersona = async (req, res) => {
  const { nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, latitud, longitud } = req.body;
  const imagen = req.file ? req.file.filename : 'default.jpg';

  try {
    const [result] = await db.execute(
      'INSERT INTO personas (nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, imagen, latitud || null, longitud || null]
    );
      // Si se subió una imagen, eliminar la anterior si existe////
    if (req.file && req.body.oldImage && req.body.oldImage !== 'default.jpg') {
      deleteImageFile(req.body.oldImage);
    }
    res.status(201).json({ id: result.insertId, message: 'Persona registrada exitosamente.', imagen_url: `http://localhost:3000/uploads/${imagen}` });
  } catch (error) {
     // Si falla la inserción, eliminar la imagen subida
    if (req.file) deleteImageFile(req.file.filename);
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
  const { nombres, apellidos, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, latitud, longitud } = req.body;

  try {
        // Obtener imagen anterior
    const [current] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [id]);
    const oldFilename = current[0]?.imagen;

    const [result] = await db.execute(
      'UPDATE personas SET nombre = ?, apellido = ?, dni = ?, calle = ?, provincia = ?, departamento = ?, localidad = ?, genero = ?, fecha_nacimiento = ?, latitud = ?, longitud = ? WHERE id = ?',
      [nombres, apellidos, dni, calle, provincia, departamento, localidad, genero, fecha_nacimiento, latitud || null, longitud || null, id]
    );
    
    // Eliminar imagen anterior si se subió una nueva
    if (req.file && oldFilename && oldFilename !== 'default.jpg') {
      deleteImageFile(oldFilename);
    }
    res.json({ message: 'Persona actualizada correctamente.' });
  } catch (error) {
       // Si falla la actualización, eliminar la nueva imagen subida
    if (req.file) deleteImageFile(req.file.filename);

    res.status(500).json({ error: 'Error al actualizar persona.', detalles: error });
  }
};

// DELETE - Eliminar persona
exports.eliminarPersona = async (req, res) => {
  const { id } = req.params;

  try {
     // Obtener imagen antes de eliminar
    const [current] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [id]);
    const filename = current[0]?.imagen;

    const [result] = await db.execute('DELETE FROM personas WHERE id = ?', [id]);
     // Eliminar imagen asociada
    if (filename && filename !== 'default.jpg') {
      deleteImageFile(filename);
    }
    res.json({ message: 'Persona eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar persona.', detalles: error });
  }
};
