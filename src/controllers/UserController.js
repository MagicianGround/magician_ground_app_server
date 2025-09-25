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

// Inicio de sesion
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
                expiresIn: '24h'
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


// Cambiar contraseña

r.patch('/change', async (req, res) => {
  const {
    token,
    userId,
    prop,
    newprop,
  } = req.body;

  console.log(token, userId, prop, newprop)

  if (!token || !prop || !newprop || !userId){
    return res.status(400).json({ message : "Datos Insuficientes"})
  }

  const allowedProps = ["username", "email", "user_password", "country", "phone_number"];
  if (!allowedProps.includes(prop)) {
    return res.status(400).json({ message: "Propiedad no válida" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const sql = `
      UPDATE users
      SET ${prop} = ?
      WHERE id = ?
    `;

    let result; // declarar afuera

    if (prop === "user_password") {
      const nuevaContraseñaEncriptada = await bcrypt.hash(newprop, 10);
      [result] = await db.query(sql, [nuevaContraseñaEncriptada, userId]);
    } else {
      [result] = await db.query(sql, [newprop, userId]);
    }

    if (result.affectedRows > 0) {
      return res.json({ message: "Usuario actualizado correctamente" });
    } else {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

  } catch (err) {
    return res.status(401).json({message : "Error al cambiar los datos"})
  }

})

// Eliminar usuario

r.delete('/delete', async (req ,res) => {
  const {
    token,
  } = req.body;

  if (!token){
    return res.status(400).json({
      message : "Datos Insuficientes"
    })
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const userId = decoded.id;
    
    const sql = "DELETE FROM users WHERE id = ?";

    const [result] = await db.query(sql, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ message: "Usuario eliminado correctamente" });

  } catch (err){
    return res.status(401).json({ message: "Token inválido o expirado" });
  }

})

// Obtener todos los usuarios (sin passwords)

r.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username, email, country, phone_number FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener un usuario por ID (sin password)

r.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT id, username, email, country, phone_number FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]); // devuelve solo un usuario
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


module.exports = r;