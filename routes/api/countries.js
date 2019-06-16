const express = require('express');
const router = express.Router();

const geo = require('../../parkrun/geo');

router.get('/', (req, res) => {
    geo.loadCountries().then((result) => {
        res.json(result);
    }, (err) => {
        res.status(400).json(err);
    });
})

module.exports = router;