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

// GUARDAR CLIENTE
router.post('/', (req, res) => {
    const { nombre, cedula, identificacion, telefono, direccion } = req.body;
    db.run(`INSERT INTO customers (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)`, 
        [nombre, cedula || identificacion, telefono, direccion], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// EDITAR CLIENTE
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, cedula, identificacion, telefono, direccion } = req.body;
    db.run(`UPDATE customers SET nombre = ?, cedula = ?, telefono = ?, direccion = ? WHERE id = ?`,
        [nombre, cedula || identificacion, telefono, direccion, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ELIMINAR CLIENTE
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ Solicitud de eliminación cliente ID: ${id}`);
    db.run(`DELETE FROM customers WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error("❌ Error eliminando cliente:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Cliente ${id} eliminado correctamente`);
        res.json({ success: true });
    });
});

module.exports = router;