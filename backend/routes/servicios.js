const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logAction } = require('./logs');

const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL DEFAULT 0
)`);

router.get('/', (req, res) => {
    db.all("SELECT * FROM services", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

    db.run(`INSERT INTO services (nombre, descripcion, precio) VALUES (?, ?, ?)`, [nombre, descripcion, precio || 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('Admin', 'CREACIÓN', 'Services', this.lastID, `Servicio: ${nombre}`);
        res.status(200).json({ success: true, id: this.lastID });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    db.run(`UPDATE services SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?`, 
        [nombre, descripcion, precio, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('Admin', 'EDICIÓN', 'Services', id, `Servicio actualizado: ${nombre}`);
        res.json({ success: true });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT nombre FROM services WHERE id = ?", [id], (err, row) => {
        const sname = row ? row.nombre : id;
        db.run(`DELETE FROM services WHERE id = ?`, [id], function(errDel) {
            if (errDel) return res.status(500).json({ error: errDel.message });
            logAction('Admin', 'ELIMINACIÓN', 'Services', id, `Eliminado servicio: ${sname}`);
            res.json({ success: true });
        });
    });
});

module.exports = router;