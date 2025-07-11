const db = require('../db');
const path = require('path');

const getPersonas = async (id = null) => {
  let sql = `SELECT * FROM personas`;
  const params = [];

  if (id) {
    sql += ` WHERE id = ?`;
    params.push(id);
  }

  const [rows] = await db.promise().query(sql, params);

  const datosConRuta = rows.map((row) => {
    return {
      ...row,
      imagen: row.imagen ? path.join(__dirname, '../uploads', row.imagen) : null,
    };
  });

  return datosConRuta;
};

const getPersonaPorId = async (id) => {
  const [rows] = await db.execute('SELECT * FROM personas WHERE id = ?', [id]);
  return rows;
};

module.exports = { getPersonaPorId };

module.exports = { getPersonas };
