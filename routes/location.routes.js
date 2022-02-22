const express = require('express');
// const { removeListener } = require('../models/locations.model');
const Location = require("../models/locations.model");
const Session = require("../models/session.model");

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

// Find locations provided with budget, category (with limit of max 3)
router.get("/findLocations", async (req, res) => {

    var categories = ["Arcade", "Cafe"]; // = req.body.categories.json;
    
    await Location.find({
        $and: [
            { budget : { $eq: req.body.budget } },
            { category : { $in: categories }}
        ]
    }).limit(3*categories.length). then(function(response)
    {
        if(response.length == 0)
        {
            res.send("No matches found");
        }
        else 
        {
            res.send(response);
        }           
    });

});


// Finds and returns matching locations given linkId
router.get("/:id/findMatchingLocations", async (req, res) => {
    
    var session = await getSession(req.params.id);
    // console.log(session);
    var categories = session.activities;
    // console.log(categories);
    var b = session.budget;
    // console.log(b);
    

    await Location.find({
        $and: [
            { budget: { $eq: b[0] } },
            { activities: { $eq: {$in: categories}}}
        ]
    }). then(function(response)
    {
        if(response.length == 0)
        {
            res.send("No matches found");
        }
        else 
        {
            res.send(response);
        }           
    });

});

// Tests router
router.get("/testLocation", function(req, res) {
    res.send("Hello Location");

});


module.exports = router;