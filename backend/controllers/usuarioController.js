// controllers/usuarioController.js
const db = require('../db');

// GET - Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios.', detalles: error });
  }
};

// POST - Agregar usuario (con imagen)
exports.agregarUsuario = async (req, res) => {

  /*  Imagen proveniente de:
      - archivo -> req.file.filename
      - cámara  -> req.body.imagenCamara          */
  const imagenArchivo = req.file?.filename || null;
  const imagenCamara  = req.body.imagenCamara     || null;

  const imagenFinal   = imagenCamara || imagenArchivo || 'default.jpg';

  const { persona_id, usuario, clave, email } = req.body;

  console.log('Imagen elegida =>', imagenFinal);

  try {
    const [result] = await db.execute(
      `INSERT INTO usuarios
        (usuario, clave, email, imagen_perfil, persona_id, imagenCamara)
      VALUES (?,?,?,?,?,?)`,
      [usuario, clave, email, imagenArchivo, persona_id, imagenCamara]
    );

    return res.status(201).json({
      id: result.insertId,
      message: 'Usuario registrado exitosamente.'
    });

  } catch (err) {
    console.error('❌  Error al registrar usuario:', err.message);
    return res.status(500).json({ error: 'Error al registrar usuario.' });
  }
};


// PUT - Editar usuario por ID
exports.editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { persona_id, username, password, email } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE usuarios SET persona_id = ?, username = ?, password = ?, email = ? WHERE id = ?',
      [persona_id, username, password, email, id]
    );
    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario.', detalles: error });
  }
};

// DELETE - Eliminar usuario por ID
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario.', detalles: error });
  }
};
