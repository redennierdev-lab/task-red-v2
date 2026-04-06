const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexión a la DB (buscamos la carpeta data que creamos arriba)
const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

// Listar todos los clientes (Endpoint: /api/customers/all)
router.get('/all', (req, res) => {
    db.all("SELECT * FROM customers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// Guardar nuevo cliente (Endpoint: /api/customers)
router.post('/', (req, res) => {
    const { nombre, cedula, telefono, direccion } = req.body;
    const sql = `INSERT INTO customers (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)`;
    db.run(sql, [nombre, cedula, telefono, direccion], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Cliente guardado con éxito" });
    });
});

module.exports = router;