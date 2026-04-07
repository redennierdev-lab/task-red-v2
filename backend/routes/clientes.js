const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Apuntamos a la base de datos en la carpeta /data
const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    cedula TEXT,
    telefono TEXT,
    direccion TEXT
)`);

// Esta es la ruta que el frontend busca
router.get('/', (req, res) => {
    db.all("SELECT * FROM customers", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { nombre, identificacion, telefono, direccion } = req.body;
    db.run(`INSERT INTO customers (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)`, 
    [nombre, identificacion, telefono, direccion], function(err) {
        if (err) return res.status(500).send(err);
        res.json({ id: this.lastID });
    });
});

module.exports = router;