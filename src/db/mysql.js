const mysql = require('mysql2');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_NAMEDB,
  waitForConnections: true,
  connectionLimit: 10,   // puedes ajustarlo según tu carga
  queueLimit: 0
});
// Exportar el pool (con promesas)
module.exports = pool.promise();