const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexión a la base de datos
const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    cliente_id INTEGER,
    tecnico_id INTEGER,
    estado TEXT DEFAULT 'Pendiente',
    FOREIGN KEY(cliente_id) REFERENCES customers(id),
    FOREIGN KEY(tecnico_id) REFERENCES technicians(id)
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
    db.run(`INSERT INTO tasks (titulo, descripcion, cliente_id, tecnico_id, estado) VALUES (?, ?, ?, ?, 'Pendiente')`,
        [titulo, descripcion, cliente_id, tecnico_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// EDITAR TAREA
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, cliente_id, tecnico_id, estado } = req.body;
    db.run(`UPDATE tasks SET titulo = ?, descripcion = ?, cliente_id = ?, tecnico_id = ?, estado = ? WHERE id = ?`,
        [titulo, descripcion, cliente_id, tecnico_id, estado, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ELIMINAR TAREA
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;