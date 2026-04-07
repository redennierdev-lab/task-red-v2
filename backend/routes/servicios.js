const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta absoluta a la base de datos
const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

// Crear la tabla si por alguna razón no existe (Evita el Error 500)
db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL
)`);

router.get('/', (req, res) => {
    db.all("SELECT * FROM services", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});


// GUARDAR SERVICIO
router.post('/', (req, res) => {
    const { nombre, precio } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const sql = `INSERT INTO services (nombre, precio) VALUES (?, ?)`;
    
    db.run(sql, [nombre, precio || 0], function(err) {
        if (err) {
            console.error("❌ ERROR EN BD:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Servicio Guardado ID: ${this.lastID}`);
        res.status(200).json({ success: true, id: this.lastID });
    });
});

module.exports = router;