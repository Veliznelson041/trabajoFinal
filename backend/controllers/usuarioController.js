// controllers/usuarioController.js
const db = require('../db');
const path = require('path');
const fs = require('fs');

const fsp = fs.promises;


const deleteImageFile = async (filename) => {
  if (!filename || filename === 'default.jpg') return;
  
  const filePath = path.join(__dirname, '../uploads', filename);
  
  try {
    await fsp.access(filePath);
    await fsp.unlink(filePath);
    console.log('Imagen eliminada correctamente.');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error al eliminar imagen:', err.message);
    }
  }
};


exports.obtenerImagenUsuario = async (req, res) => {
  try {
    //  console.log(Solicitando imagen para ID: ${req.params.id});
    const [rows] = await db.execute('SELECT imagen FROM usuarios WHERE id = ?', [req.params.id]);
    
    if (!rows.length || !rows[0].imagen) {
      //  console.log('No se encontró registro o imagen en la base de datos');
      return res.status(404).send('Imagen no encontrada');
    }

    console.log(`Nombre de archivo en DB: ${rows[0].imagen}`);

    const imagePath = path.join(__dirname, '../../uploads', rows[0].imagen);
      console.log(`Ruta completa del archivo: ${imagePath}`);
    
    
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
// GET 
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios.', detalles: error });
  }
};

// POST 
exports.agregarUsuario = async (req, res) => {
  const { persona_id, usuario, clave, email } = req.body;
  const imagen = req.file ? req.file.filename : 'default.jpg';

  try {
    const [result] = await db.execute(
      'INSERT INTO usuarios (usuario, clave, email, imagen_perfil, persona_id) VALUES (?, ?, ?, ?, ?)',
      [usuario, clave, email, imagen, persona_id]
    );
    
    if (req.file && req.body.oldImage && req.body.oldImage !== 'default.jpg') {
      deleteImageFile(req.body.oldImage);
    }
    res.status(201).json({ id: result.insertId, message: 'Usuario registrado exitosamente.' });
  } catch (error) {
       if (req.file?.limpiarArchivos) {
      await limpiarArchivos(req.file.limpiarArchivos);
    }
    res.status(500).json({ error: 'Error al registrar usuario.', detalles: error });
  }
};

// PUT 
exports.editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { persona_id, username, password, email } = req.body;
  const newImage = req.file ? req.file.filename : null; 
  try {
     const [current] = await db.execute('SELECT imagen FROM usuarios WHERE id = ?', [id]);
    const oldFilename = current[0]?.imagen;
    let query;
    let params;
    
    if (newImage) {
      query = `
        UPDATE usuarios
        SET persona_id = ?, username = ?, password = ?, email = ?, imagen_perfil = ?
        WHERE id = ?`;
      params = [
        persona_id, username, password, email, newImage, id
      ];
    } else {
      query = `
        UPDATE usuarios
        SET persona_id = ?, username = ?, password = ?, email = ?
        WHERE id = ?`;
      params = [
        persona_id, username, password, email, id
      ];
    }

    const [result] = await db.execute(query, params);

     if (newImage) {
      if (oldFilename && oldFilename !== 'default.jpg') {
        deleteImageFile(oldFilename);
      }
    }

    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario.', detalles: error });
  }
};

// DELETE
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario.', detalles: error });
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

