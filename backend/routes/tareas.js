const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logAction } = require('./logs');

const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    cliente_id INTEGER,
    tecnico_admin_id INTEGER,
    instalador_id INTEGER,
    estado TEXT DEFAULT 'Pendiente',
    FOREIGN KEY(cliente_id) REFERENCES customers(id),
    FOREIGN KEY(tecnico_admin_id) REFERENCES technicians(id),
    FOREIGN KEY(instalador_id) REFERENCES technicians(id)
)`);

// Parche dinámico para añadir timestamp sin borrar DB
db.run("ALTER TABLE tasks ADD COLUMN started_at BIGINT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
        console.error("Error auto-adding started_at column", err.message);
    }
});

// CRON JOB AUTOMÁTICO - Busca tareas "En proceso" con > 1 hora de antigüedad
setInterval(() => {
    const limitTime = Date.now() - (60 * 60 * 1000); 
    db.all(`SELECT id, ticket_id FROM tasks WHERE estado = 'En proceso' AND started_at < ?`, [limitTime], (err, rows) => {
        if (!err && rows && rows.length > 0) {
            rows.forEach(row => {
               db.run(`UPDATE tasks SET estado = 'Pendiente', started_at = NULL WHERE id = ?`, [row.id], (upErr) => {
                   if (!upErr) logAction('SISTEMA', 'TIEMPO EXCEDIDO', 'Tasks', row.ticket_id || row.id, 'Tarea devuelta a pendiente automáticamente');
               });
            });
        }
    });
}, 10000);

router.get('/', (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { titulo, descripcion, cliente_id, tecnico_admin_id, instalador_id, estado } = req.body;
    db.get(`SELECT ticket_id FROM tasks ORDER BY id DESC LIMIT 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        let nextSequenceNumber = 1;
        if (row && row.ticket_id) {
            const lastNum = parseInt(row.ticket_id.split('-')[1], 10);
            if (!isNaN(lastNum)) nextSequenceNumber = lastNum + 1;
        }
        const newTicketId = `TSK-${String(nextSequenceNumber).padStart(4, '0')}`;
        db.run(`INSERT INTO tasks (ticket_id, titulo, descripcion, cliente_id, tecnico_admin_id, instalador_id, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [newTicketId, titulo, descripcion, cliente_id, tecnico_admin_id, instalador_id, estado || 'Pendiente'], function(errInsert) {
            if (errInsert) return res.status(500).json({ error: errInsert.message });
            logAction('Admin', 'CREACIÓN', 'Tasks', newTicketId, `Título: ${titulo}`);
            res.json({ id: this.lastID, ticket_id: newTicketId });
        });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, cliente_id, tecnico_admin_id, instalador_id, estado } = req.body;
    db.run(`UPDATE tasks SET titulo = ?, descripcion = ?, cliente_id = ?, tecnico_admin_id = ?, instalador_id = ?, estado = ? WHERE id = ?`,
        [titulo, descripcion, cliente_id, tecnico_admin_id, instalador_id, estado, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('Admin', 'EDICIÓN', 'Tasks', id, `Nuevo estado: ${estado}`);
        res.json({ success: true });
    });
});

router.put('/:id/state', (req, res) => {
    const { id } = req.params;
    const { estado, started_at } = req.body;
    let query = `UPDATE tasks SET estado = ?`;
    let params = [estado];
    if (started_at) {
        query += `, started_at = ?`;
        params.push(started_at);
    }
    query += ` WHERE id = ?`;
    params.push(id);
    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('Técnico', 'CAMBIO ESTADO', 'Tasks', id, `Estado cambiado a: ${estado}`);
        res.json({ success: true });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT ticket_id FROM tasks WHERE id = ?", [id], (err, row) => {
        const tid = row ? row.ticket_id : id;
        db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(errDel) {
            if (errDel) return res.status(500).json({ error: errDel.message });
            logAction('Admin', 'ELIMINACIÓN', 'Tasks', tid, 'Registro eliminado permanentemente');
            res.json({ success: true });
        });
    });
});

module.exports = router;