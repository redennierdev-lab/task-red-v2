const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

// Asegurar la tabla de auditoría existe
db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT,
    accion TEXT,
    tabla TEXT,
    registro_id TEXT,
    detalle TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Función de ayuda para registrar logs desde el backend
const logAction = (usuario, accion, tabla, registro_id, detalle) => {
    db.run(`INSERT INTO audit_logs (usuario, accion, tabla, registro_id, detalle) VALUES (?, ?, ?, ?, ?)`,
        [usuario, accion, tabla, String(registro_id), detalle], (err) => {
            if (err) console.error("Error guardando log auditoría:", err.message);
        });
};

// Obtener todos los logs
router.get('/', (req, res) => {
    db.all("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = {
    router,
    logAction
};
