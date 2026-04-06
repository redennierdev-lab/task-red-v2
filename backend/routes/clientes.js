const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

// OBTENER CLIENTES
router.get('/', (req, res) => {
    db.all("SELECT * FROM customers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// GUARDAR CLIENTE
router.post('/', (req, res) => {
    const { nombre, identificacion, telefono, direccion } = req.body;
    // IMPORTANTE: Usamos 'cedula' porque así creaste la tabla en server.js
    const sql = `INSERT INTO customers (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [nombre, identificacion, telefono, direccion || ''], function(err) {
        if (err) {
            console.error("Error SQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, status: "success" });
    });
});

module.exports = router;