const express = require('express');
const { removeListener } = require('../models/location.model');
const PollPage = require("../models/pollPage.model");
const location = require("../models/location.model");

var router = express.Router();


// find matching lcations with given budget and category
// router.get("/findMatchingLocations", function(req, res) {
    
//     var myCursor = location.find({

//         $and: [
//             { budget: { $eq: req.body.budget } },
//             { category: { $eq: req.body.category } }
//         ]
        
//     });

//     var myDocument = myCursor.hasNext() ? myCursor.next() : null;

//     if(myDocument)
//     {
//         var name = myDocument.locationName;
//         print(tojson(name));
//     }

// });


// // Add a new location 
// router.post("/newLocation", async (req, res) => {

//     const newLocation = new Location({
        
//         linkId: req.body.linkId,
//         locationName: req.body.locationName
//     });
//     newLocation.votes = 0;

//     try {
//         newLocation
//         .save()
//         .then(() => res.json(newLocation._id))
//     } catch(err) {
//         res.status(400).json("Error: " + err)};

// });

router.get("/testPollPage", function(req, res) {
    res.send("Hello PollPage");

});


module.exports = router;


// // Update location votes of an existing location
// router.put("/updateLocation", async (req, res) => {

//     const newLocation = new Location({
        
//         linkId: req.body.linkId,
//         locationId: createID()
//         // locationName: 
//     });
//     newLocation.votes = 0;

//     try {
//         newLocation
//         .save()
//         .then(() => res.json(newLocation.l))
//     } catch(err) {
//         res.status(400).json("Error: " + err)};

// });