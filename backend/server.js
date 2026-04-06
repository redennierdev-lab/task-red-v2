const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const dbPath = path.resolve(__dirname, '../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor RED ENNIER Operativo');
});

// --- CAMBIO AQUÍ: Ruta en inglés para que coincida con el Frontend ---
app.post('/api/customers', (req, res) => {
    const { nombre, identificacion, telefono, direccion } = req.body;
    
    // Insertamos en la tabla customers (asegúrate que los nombres de columnas coincidan)
    const sql = `INSERT INTO customers (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [nombre, identificacion, telefono, direccion || ''], function(err) {
        if (err) {
            console.error("Error SQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("✅ Cliente guardado con ID:", this.lastID);
        res.status(200).json({ message: "Cliente guardado", id: this.lastID });
    });
});

// Ruta para listar (GET)
app.get('/api/customers', (req, res) => {
    db.all("SELECT * FROM customers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log('-----------------------------------------');
    console.log(`🚀 MOTOR RED ENNIER V2 - CONECTADO`);
    console.log(`📡 Escuchando en http://localhost:${PORT}`);
    console.log('-----------------------------------------');
});