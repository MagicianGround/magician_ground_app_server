require('dotenv').config();

const Express = require('express');
const cors = require('cors');

const app = Express();

const UserController = require('./controllers/UserController') 
const MeasurementController = require('./controllers/MeasurementController')

const PORT = process.env.PORT || 8080;

app.use(Express.json())
app.use(cors())



/*
 Mysql
*/

// Crear conexión
const db = require('./db/mysql');

// Conectar
(async () => {
  try {
    await db.query('SELECT 1'); // test rápido
    console.log('Conectado a MySQL ✅');
  } catch (err) {
    console.error('Error conectando a MySQL:', err);
  }
})();

// Mongodb






/*
 Router
 app.use('', (req, res) => {
    res.json({
        message : "Backend temporal de magician ground"
    })
})
*/

app.use('/user', UserController)
app.use('/measurements', MeasurementController)

app.listen(PORT, () => {
    console.log("App running in port:", PORT);
})



