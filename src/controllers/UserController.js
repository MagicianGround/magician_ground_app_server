const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/mysql'); // pool de mysql.js
const { sendRecoveryEmail } = require("../utils/mailer");


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

r.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [rows] = await db.query(
      "SELECT id, username, email, country, phone_number FROM users WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]); // devuelve solo un usuario
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

r.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requerido" });
  }

  try {
    // Buscar usuario
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userId = rows[0].id;

    // Generar recoveryKey
    const recoveryKey = await bcrypt.hash(Date.now().toString(), 10);

    // Guardar en DB
    await db.query(
      "INSERT INTO recovery_keys (user_id, recovery_key) VALUES (?, ?)",
      [userId, recoveryKey]
    );

    // 📧 Enviar email con el link
    await sendRecoveryEmail(email, recoveryKey);

    return res.json({ message: "Correo de recuperación enviado" });
  } catch (err) {
    console.error("Error en forgot-password:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// --- Reset password with recovery key ---
r.post('/reset-password', async (req, res) => {
  const { recoveryKey, newPassword } = req.body;

  if (!recoveryKey || !newPassword) {
    return res.status(400).json({ message: "Datos insuficientes" });
  }

  try {
    // Validate recovery key
    const [rows] = await db.query(
      "SELECT user_id FROM recovery_keys WHERE recovery_key = ? LIMIT 1",
      [recoveryKey]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Clave de recuperación inválida o expirada" });
    }

    const userId = rows[0].user_id;

    // 🔒 Hash new password with bcrypt
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.query("UPDATE users SET user_password = ? WHERE id = ?", [newHash, userId]);

    // Remove recovery key after use
    await db.query("DELETE FROM recovery_keys WHERE recovery_key = ?", [recoveryKey]);

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en reset-password:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});



module.exports = r;