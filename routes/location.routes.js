const express = require('express');
const Location = require("../models/locations.model");
const Session = require("../models/session.model");

var router = express.Router();


// finds and returns session given linkID
async function getSession (id)
{
    var session;
    await Session.findOne({
        linkID: { $eq: id }
    }). then(function(response)
    {
        // console.log(response.activities);
        session = response; //.budget[0];
        // console.log(budget);
        
    })
    return session;
}


// Add a new location 
router.post("/addNewLocation", async (req, res) => {

    const newLocation = new location({

        locationName: req.body.locationName,
        budget: req.body.budget,
        type: req.body.type,
        location: req.body.location,
        distance: req.body.distance,
        description: req.body.description,
        rating: req.body.rating,
        reviews: req.body.reviews,
        
    });

    try {
        newLocation
        .save()
        .then(() => res.send("Added new Location"))
    } catch(err) {
        res.status(400).json("Error: " + err)};

});

// Find locations provided with budget, category (with limit of max 3)
router.get("/findLocations", async (req, res) => {

    var categories = ["Arcade", "Cafe"]; // = req.body.categories.json;
    
    await Location.find({
        $and: [
            { budget : { $eq: req.body.budget } },
            { type : { $in: categories}}
        ]
    })
    .limit(3*categories.length)
    .then(function(response)
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
    console.log(categories);
    var b = session.budget;
    // console.log(b);
    

    await Location.find({
        $and: [
            { budget: { $eq: b[0] } },
            { type:  {$in: categories}}
        ]
    })
    .then(function(response)
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