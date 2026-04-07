const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellidos TEXT,
    cedula TEXT,
    tipo TEXT,
    clasificacion TEXT,
    correo TEXT,
    telefono TEXT,
    whatsapp TEXT,
    direccion TEXT,
    coordenadas TEXT,
    status TEXT DEFAULT 'Activo'
)`);

db.run(`CREATE TABLE IF NOT EXISTS client_equipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    servicio_requerido TEXT,
    tipo_instalacion TEXT,
    antena_tipo TEXT,
    antena_modelo TEXT,
    antena_marca TEXT,
    antena_serial TEXT,
    antena_usuario TEXT,
    antena_password TEXT,
    antena_ip TEXT,
    puerto_forward TEXT,
    router_modelo TEXT,
    router_tipo TEXT,
    router_version TEXT,
    FOREIGN KEY(cliente_id) REFERENCES customers(id) ON DELETE CASCADE
)`);

router.get('/', (req, res) => {
    db.all(`
        SELECT c.*, 
        e.servicio_requerido, e.tipo_instalacion, e.antena_ip
        FROM customers c 
        LEFT JOIN client_equipments e ON c.id = e.cliente_id
    `, [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// GUARDAR CLIENTE (Con Ficha Técnica Opcional)
router.post('/', (req, res) => {
    const { 
        nombre, apellidos, cedula, tipo, clasificacion, correo, telefono, whatsapp, direccion, coordenadas,
        equipments 
    } = req.body;

    db.run(`INSERT INTO customers (nombre, apellidos, cedula, tipo, clasificacion, correo, telefono, whatsapp, direccion, coordenadas) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [nombre, apellidos, cedula, tipo, clasificacion, correo, telefono, whatsapp, direccion, coordenadas], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const clientId = this.lastID;
            
            if (equipments && Object.keys(equipments).length > 0) {
                const { servicio_requerido, tipo_instalacion, antena_tipo, antena_modelo, antena_marca, antena_serial, antena_usuario, antena_password, antena_ip, puerto_forward, router_modelo, router_tipo, router_version } = equipments;
                
                db.run(`INSERT INTO client_equipments (cliente_id, servicio_requerido, tipo_instalacion, antena_tipo, antena_modelo, antena_marca, antena_serial, antena_usuario, antena_password, antena_ip, puerto_forward, router_modelo, router_tipo, router_version) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [clientId, servicio_requerido, tipo_instalacion, antena_tipo, antena_modelo, antena_marca, antena_serial, antena_usuario, antena_password, antena_ip, puerto_forward, router_modelo, router_tipo, router_version],
                    function(errEq) {
                        if (errEq) console.error("Error guardando ficha:", errEq);
                        res.json({ id: clientId, equipment_id: this.lastID });
                    });
            } else {
                res.json({ id: clientId });
            }
    });
});

// ELIMINAR CLIENTE
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM client_equipments WHERE cliente_id = ?`, [id], () => {
        db.run(`DELETE FROM customers WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Get ficha tecnica
router.get('/:id/equipment', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM client_equipments WHERE cliente_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

module.exports = router;