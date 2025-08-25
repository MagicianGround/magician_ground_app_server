const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/mysql'); // importamos el pool de mysql.js

const r = express.Router();

const jwt = require('jsonwebtoken')

// Register
r.post('/signup', async (req, res) => {
  try {
    const {
      username,
      email,
      user_password,
      country,   // corregido (antes conutry)
      phone_number
    } = req.body;

    console.log(username, email, user_password, country, phone_number);

    // Validación de datos
    if (!username || !email || !user_password || !country || !phone_number) {
      return res.status(400).json({
        message: "No hay suficientes datos"
      });
    }

    // Encriptar la contraseña
    const cry_user_password = await bcrypt.hash(user_password, 10);

    // SQL
    const sql = `
      INSERT INTO users (username, email, user_password, country, phone_number)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Ejecutar query con pool (promesas)
    const [result] = await db.query(sql, [
      username,
      email,
      cry_user_password,
      country,
      parseInt(phone_number)
    ]);

    console.log("Usuario insertado con ID:", result.insertId);

    res.json({
      message: "Usuario insertado correctamente",
      userId: result.insertId
    });
  } catch (err) {
    console.error("Error al registrar usuario:", err);

    if(err.code == "ER_DUP_ENTRY"){
        return res.status(400).json({
            message : "El email o numero de telefono ya estan ciendo utilizados"
        })
    }

    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Inicio de secion
r.post('/login', async (req, res) => {
    const {
        email,
        user_password,
    } = req.body;

    if(!email || !user_password){
        return res.status(400).json({
            message : "Datos Insuficientes"
        })
    }

    try {
        // Buscar usuario por email
        const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

        if (rows.length === 0) {
        return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const user = rows[0];

        // Comparar password ingresado con hash guardado
        const isMatch = await bcrypt.compare(user_password, user.user_password);

        if (!isMatch) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            {id:user.id, email : user.email },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )
        
        res.json({ 
            message: "Login exitoso", 
            userId: user.id, 
            token,
        });

    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }


})

module.exports = r;