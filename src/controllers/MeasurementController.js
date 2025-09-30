const express = require('express');
const db = require('../db/mysql'); // pool de mysql.js

const r = express.Router();

r.get("/temperatura", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      "SELECT device_id, sensor, variable, seq, tiempo_estimado FROM simulated_measurements ORDER BY tiempo_estimado DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener mediciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

r.get("/humedad", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      "SELECT device_id, sensor, variable, unidad, seq, tiempo_estimado FROM simulated_measurements ORDER BY tiempo_estimado DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener mediciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

r.get("/salinidad", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      "SELECT device_id, sensor, variable, unidad, seq, tiempo_estimado FROM simulated_measurements ORDER BY tiempo_estimado DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener mediciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

r.get("/pH", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      "SELECT device_id, sensor, variable, unidad, seq, tiempo_estimado FROM simulated_measurements ORDER BY tiempo_estimado DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener mediciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
module.exports = r;
