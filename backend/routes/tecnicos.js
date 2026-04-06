const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../../data/red_ennier.sqlite'));

router.get('/', (req, res) => {
    db.all("SELECT * FROM technicians", [], (err, rows) => {
        res.json(rows || []);
    });
});

module.exports = router;