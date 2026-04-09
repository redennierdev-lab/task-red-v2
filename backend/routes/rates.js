const express = require('express');
const router = express.Router();
const rateService = require('../services/rateService');

router.get('/', (req, res) => {
    const rates = rateService.getRates();
    res.json(rates);
});

module.exports = router;
