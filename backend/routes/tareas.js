const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexión a la base de datos
const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    descripcion TEXT,
    cliente_id INTEGER,
    tecnico_id INTEGER,
    estado TEXT
)`);

router.get('/', (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});


// RUTA PARA GUARDAR LA TAREA
router.post('/', (req, res) => {
    const { titulo, descripcion, cliente_id, tecnico_id } = req.body;
    const sql = `INSERT INTO tasks (titulo, descripcion, cliente_id, tecnico_id, estado) VALUES (?, ?, ?, ?, 'Pendiente')`;
    
    db.run(sql, [titulo, descripcion, cliente_id, tecnico_id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Tarea creada", id: this.lastID });
    });
});

module.exports = router;