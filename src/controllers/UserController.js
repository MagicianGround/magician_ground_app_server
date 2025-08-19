const Express = require('express');
const r = Express.Router()
const mysql = require('mysql2')
const bcrypt = require('bcrypt');

const connection = require('../db/mysql');
const { parse } = require('dotenv');


r.post('/singup/', async (req, res) => {
    const {
        username,
        email,
        user_password,
        conutry,
        phone_number
    } = req.body;

    console.log(username, email, user_password, conutry, phone_number)
    
    if (!username || !email || !user_password || !conutry || !phone_number){
        return res.status(400).json({
            message : "No hay suficiantes datos"
        })
    }

    
    let cry_user_password = await bcrypt.hash(user_password, 10);

    const sql = `
    INSERT INTO users (username, email, user_password, country, phone_number)
    VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(sql, [
        username, 
        email,
        cry_user_password,
        conutry, 
        parseInt(phone_number)
    ], (err, resuls) => {
        if (err){
            console.error("Error al registrar los datos", err)
        }
        console.log("Usueario nuevo insertados", user_password)
        res.json({
            message: "Usuario insertado correctamente"
        })
    })


})


module.exports = r