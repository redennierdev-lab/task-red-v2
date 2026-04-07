const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logAction } = require('./logs');
const db = new sqlite3.Database(path.resolve(__dirname, '../../data/red_ennier.sqlite'));

db.run(`CREATE TABLE IF NOT EXISTS technicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    especialidad TEXT,
    telefono TEXT,
    status TEXT DEFAULT 'Activo'
)`);

router.get('/', (req, res) => {
    db.all("SELECT * FROM technicians", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { nombre, especialidad, telefono } = req.body;
    db.run(`INSERT INTO technicians (nombre, especialidad, telefono, status) VALUES (?, ?, ?, 'Activo')`, 
        [nombre, especialidad, telefono], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('Admin', 'CREACIÓN', 'Technicians', this.lastID, `Técnico: ${nombre}`);
        res.json({ id: this.lastID });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, especialidad, telefono, status } = req.body;
    db.run(`UPDATE technicians SET nombre = ?, especialidad = ?, telefono = ?, status = ? WHERE id = ?`, 
        [nombre, especialidad, telefono, status || 'Activo', id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('Admin', 'EDICIÓN', 'Technicians', id, `Técnico actualizado: ${nombre}`);
        res.json({ success: true });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT nombre FROM technicians WHERE id = ?", [id], (err, row) => {
        const tname = row ? row.nombre : id;
        db.run(`DELETE FROM technicians WHERE id = ?`, [id], function(errDel) {
            if (errDel) return res.status(500).json({ error: errDel.message });
            logAction('Admin', 'ELIMINACIÓN', 'Technicians', id, `Eliminado técnico: ${tname}`);
            res.json({ success: true });
        });
    });
});

module.exports = router;