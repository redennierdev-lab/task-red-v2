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
    descripcion TEXT,
    precio REAL DEFAULT 0
)`);

router.get('/', (req, res) => {
    db.all("SELECT * FROM services", [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});


// GUARDAR SERVICIO
router.post('/', (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const sql = `INSERT INTO services (nombre, descripcion, precio) VALUES (?, ?, ?)`;
    
    db.run(sql, [nombre, descripcion, precio || 0], function(err) {
        if (err) {
            console.error("❌ ERROR EN BD:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ success: true, id: this.lastID });
    });
});

// EDITAR SERVICIO
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    db.run(`UPDATE services SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?`, 
        [nombre, descripcion, precio, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ELIMINAR SERVICIO
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ Solicitud de eliminación servicio ID: ${id}`);
    db.run(`DELETE FROM services WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error("❌ Error eliminando servicio:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Servicio ${id} eliminado correctamente`);
        res.json({ success: true });
    });
});

module.exports = router;