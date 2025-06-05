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
  const { persona_id, usuario, clave, email } = req.body;
  const imagen = req.file ? req.file.filename : null;

  try {
    const [result] = await db.execute(
      'INSERT INTO usuarios (usuario, clave, email, imagen_perfil, persona_id) VALUES (?, ?, ?, ?, ?)',
      [usuario, clave, email, imagen, persona_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario.', detalles: error });
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
