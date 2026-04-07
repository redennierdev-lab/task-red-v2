const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../../data/red_ennier.sqlite'));

db.run(`CREATE TABLE IF NOT EXISTS technicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    status TEXT
)`);

router.get('/', (req, res) => {
    db.all("SELECT * FROM technicians", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});


router.post('/', (req, res) => {
    const { nombre } = req.body;
    db.run(`INSERT INTO technicians (nombre, status) VALUES (?, 'Activo')`, [nombre], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});
module.exports = router;