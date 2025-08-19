require('dotenv').config();

const Express = require('express');
const cors = require('cors');
const mysql = require('mysql2')


const app = Express();

const UserController = require('./controllers/UserController') 

const PORT = process.env.PORT;

app.use(Express.json())
app.use(cors())



/*
 Mysql
*/

// Crear conexión
const connection = require('./db/mysql');

// Conectar
connection.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Cerrar conexión (cuando ya no se use)
connection.end();


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


app.listen(PORT, () => {
    console.log("App running in 8080")
})



