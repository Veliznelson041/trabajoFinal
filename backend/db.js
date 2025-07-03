const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '48615',
  database: 'registrodynamite',
  waitForConnections: true,
  port: 3306,
  connectionLimit: 10,
  queueLimit: 0
});
// Verificar conexión al iniciar
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
  }
})();

module.exports = pool;
