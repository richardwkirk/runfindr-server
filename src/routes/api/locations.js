const express = require('express');
const router = express.Router();

const geo = require('../../parkrun/geo');

router.get('/:region', (req, res) => {
    console.log(`Location request for [${req.params.region}]`);
    geo.loadRegion(req.params.region).then((result) => {
        res.json(result);
    }, (err) => {
        res.status(400).json(err);
    });
})

module.exports = router;