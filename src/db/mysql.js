const mysql = require('mysql2');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "proalafalda",
  database: "magiciangrounddatabase",
  waitForConnections: true,
  connectionLimit: 10,   // puedes ajustarlo según tu carga
  queueLimit: 0
});

// Exportar el pool (con promesas)
module.exports = pool.promise();