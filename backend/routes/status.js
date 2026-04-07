const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/red_ennier.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error("Error connecting for status ping:", err.message);
});

router.get('/', (req, res) => {
    // Ping sencillo: consultar tabla master o simplemente retornar OK si la instancia existe
    const start = Date.now();
    db.get("SELECT 1 FROM sqlite_master", [], (err, row) => {
        const ms = Date.now() - start;
        if (err) {
            return res.status(500).json({ status: 'offline', ms: 0, error: err.message });
        }
        res.json({ status: 'online', ms: ms });
    });
});

module.exports = router;
