var express = require("express");
var router = express.Router();

const Trend = require("../models/trends");

// GET /trends --> retrieve all trends
router.get('/',(req,res) => {
    Trend.find().then((data) => {
        res.json({result:true, trends: data})
    })
})

module.exports = router;
