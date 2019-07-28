const express = require('express');
const router = express.Router();

const athleteData = require('../../parkrun/athleteData');

router.get('/history/:athleteId', (req, res) => {
    console.log(`Athlete history request for [${req.params.athleteId}]`);
    athleteData.loadHistory(req.params.athleteId).then((result) => {
        res.json(result);
    }, (err) => {
        res.status(400).json(err);
    });
})

module.exports = router;