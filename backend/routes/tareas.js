const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../../data/red_ennier.sqlite'));

// Listar tareas
router.get('/', (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        res.json(rows || []);
    });
});

// Crear tarea
router.post('/', (req, res) => {
    const { titulo, descripcion, cliente_id, tecnico_id } = req.body;
    const sql = `INSERT INTO tasks (titulo, descripcion, cliente_id, tecnico_id) VALUES (?, ?, ?, ?)`;
    db.run(sql, [titulo, descripcion, cliente_id, tecnico_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, status: "Tarea creada" });
    });
});

module.exports = router;