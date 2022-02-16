const express = require('express');
// const { removeListener } = require('../models/locations.model');
const Location = require("../models/locations.model");

var router = express.Router();


// Add a new location 
router.post("/addNewLocation", async (req, res) => {

    const newLocation = new Location({

        locationName: req.body.locationName,
        budget: req.body.budget,
        category: req.body.category  
        
    });

    try {
        newLocation
        .save()
        .then(() => res.json(newLocation._id))
    } catch(err) {
        res.status(400).json("Error: " + err)};

});

router.get("/testLocation", function(req, res) {
    res.send("Hello Location");

});


module.exports = router;