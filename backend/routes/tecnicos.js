const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
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
        res.json({ id: this.lastID });
    });
});

// EDITAR TÉCNICO
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, especialidad, telefono, status } = req.body;
    db.run(`UPDATE technicians SET nombre = ?, especialidad = ?, telefono = ?, status = ? WHERE id = ?`, 
        [nombre, especialidad, telefono, status || 'Activo', id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ELIMINAR TÉCNICO
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ Solicitud de eliminación técnico ID: ${id}`);
    db.run(`DELETE FROM technicians WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error("❌ Error eliminando técnico:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Técnico ${id} eliminado correctamente`);
        res.json({ success: true });
    });
});

module.exports = router;