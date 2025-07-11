const db = require('../db');
const path = require('path');
const fs = require('fs');

const fsp = fs.promises;


const deleteImageFile = async (filename) => {
  if (!filename || filename === 'default.jpg') return;
  
  const filePath = path.join(__dirname, '../../uploads', filename);
  
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

//funcion para el endpoint de buscar la imagen en las rutas de pesona 
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

// POST 
exports.registrarPersona = async (req, res) => {
  const { nombre, apellido, dni, calle, provincia, departamento, municipio, localidad, genero, fecha_nacimiento, latitud, longitud } = req.body;
  const imagen = req.file ? req.file.filename : 'default.jpg';

  try {

    const [result] = await db.execute(
      'INSERT INTO personas (nombre, apellido, dni, calle, provincia, departamento, municipio, localidad, genero, fecha_nacimiento, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, dni, calle, provincia, departamento, municipio, localidad, genero, fecha_nacimiento, imagen, latitud || null, longitud || null]
    );
    
    if (req.file && req.body.oldImage && req.body.oldImage !== 'default.jpg') {
      deleteImageFile(req.body.oldImage);
    }
    res.status(201).json({ id: result.insertId, message: 'Persona registrada exitosamente.'});

  } catch (error) {   
       if (req.file?.limpiarArchivos) {
      await limpiarArchivos(req.file.limpiarArchivos);
    }
     if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'El DNI ya está registrado',
        campo: 'dni'
      });
    }
    res.status(500).json({ error: 'Error al registrar persona.', detalles: error.message });
  }
};

exports.obtenerPersonaPorId = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM personas WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Persona no encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener persona.', detalles: error.message });
    }
};

// GET con búsqueda y paginación (corregido)
exports.obtenerPersonasFiltradas = async (req, res) => {
  const { page = 1, limit = 10, search = '', genero = '', provincia = '' } = req.query;
  
  // Validar y convertir parámetros numéricos
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = `
      SELECT SQL_CALC_FOUND_ROWS 
        id, nombre, apellido, dni, provincia, genero, fecha_nacimiento, imagen
      FROM personas
      WHERE 1=1
    `;
    
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR apellido LIKE ? OR dni LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (genero) {
      query += ' AND genero = ?';
      params.push(genero);
    }

    if (provincia) {
      query += ' AND provincia = ?';
      params.push(provincia);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    
    // Asegurar que los parámetros de paginación sean números
    params.push(limitNum.toString(), offset.toString());

    // console.log('Consulta SQL:', query);
    // console.log('Parámetros:', params);

    const [rows] = await db.execute(query, params);
    const [total] = await db.execute('SELECT FOUND_ROWS() as total');
    const totalRows = total[0].total;

    res.json({
      personas: rows,
      total: totalRows,
      totalPages: Math.ceil(totalRows / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Error en obtenerPersonasFiltradas:', error);
    res.status(500).json({ 
      error: 'Error al obtener personas.', 
      detalles: error.message
    });
  }
};

// GET 
exports.obtenerPersonas = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM personas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener personas.', detalles: error.message});
  }
};

// PUT 
exports.editarPersona = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, calle, provincia, departamento, municipio, localidad, genero, fecha_nacimiento, latitud, longitud } = req.body;
  const newImage = req.file ? req.file.filename : null;
  // console.log(req.body);
  try { 
    const [current] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [id]);
    const oldFilename = current[0]?.imagen;
    let query;
    let params;
    
    if (newImage) {
      query = `
        UPDATE personas 
        SET nombre = ?, apellido = ?, dni = ?, calle = ?, 
            provincia = ?, departamento = ?, municipio = ?, localidad = ?, 
            genero = ?, fecha_nacimiento = ?, imagen = ?,
            latitud = ?, longitud = ? 
        WHERE id = ?`;
      params = [
        nombre, apellido, dni, calle, 
        provincia, departamento, municipio, localidad, 
        genero, fecha_nacimiento, newImage,
        latitud || null, longitud || null, id
      ];
    } else {
      query = `
        UPDATE personas 
        SET nombre = ?, apellido = ?, dni = ?, calle = ?, 
            provincia = ?, departamento = ?, municipio = ?, localidad = ?, 
            genero = ?, fecha_nacimiento = ?,
            latitud = ?, longitud = ? 
        WHERE id = ?`;
      params = [
        nombre, apellido, dni, calle, 
        provincia, departamento, municipio, localidad, 
        genero, fecha_nacimiento,
        latitud || null, longitud || null, id
      ];
    }

    const [result] = await db.execute(query, params);
    
     if (newImage) {
      if (oldFilename && oldFilename !== 'default.jpg') {
        deleteImageFile(oldFilename);
      }
    }

    res.json({ message: 'Persona actualizada correctamente.' });
  } catch (error) {
      if (newImage) {
      deleteImageFile(newImage);
    }

    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'El DNI ya está registrado',
        campo: 'dni'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al actualizar persona.', 
      detalles: error.message 
    });
  }
};

// DELETE
exports.eliminarPersona = async (req, res) => {
  const { id } = req.params;

  try {
    
    const [current] = await db.execute('SELECT imagen FROM personas WHERE id = ?', [id]);
    const filename = current[0]?.imagen;

    const [result] = await db.execute('DELETE FROM personas WHERE id = ?', [id]);
     
    if (filename && filename !== 'default.jpg') {
      deleteImageFile(filename);
    }
    res.json({ message: 'Persona eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar persona.', detalles: error });
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

exports.limpiarArchivos = limpiarArchivos;