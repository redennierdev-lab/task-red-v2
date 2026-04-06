const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../../data/red_ennier.sqlite'));

// Simular el usuario actual
router.get('/me', (req, res) => {
    res.json({ id: 1, username: "CarlosEnnyerve", role: "admin" });
});

// Listar todos los usuarios para el menú de configuración
router.get('/users', (req, res) => {
    res.json([{ id: 1, username: "CarlosEnnyerve", role: "admin" }]);
});

// Login
router.post('/login', (req, res) => {
    res.json({ 
        user: { id: 1, username: "CarlosEnnyerve", role: "admin" },
        token: "llave-maestra-red-ennier"
    });
});

module.exports = router;