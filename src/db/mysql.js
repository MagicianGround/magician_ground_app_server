const mysql = require('mysql2')

// Crear conexión
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,    // o la IP del servidor MySQL
  port:process.env.MYSQL_PORT,
  user: process.env.MYSQL_USERNAME,         // tu usuario de MySQL
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_NAMEDB
});


module.exports = connection;