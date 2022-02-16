const express = require('express');
const PollPage = require("../models/pollPage.model");
const location = require("../models/locations.model");

var mongo = require('mongodb').MongoClient;

var router = express.Router();


// find matching locations with given budget and category
router.get("/findMatchingLocations", async (req, res) => {

    await location.find({
        $and: [
            { budget: { $eq: req.body.budget } },
            { category: { $eq: req.body.category } }
        ]
    }). then(function(response)
    {
        if(response.length == 0)
        {
            res.send("No matches found");
        }
        else 
        {
            // console.log(response[0]._id);
            res.send(response);
        }           
    });

});


function createPoll(loc, id)
{
    const poll = new PollPage ( {
        linkId: id,
        locationId: loc._id,
        locationName: loc.locationName

    });
    poll.save();
}

// create the matching location documents
router.get("/createLocationDocuments", async (req, res) => {

    let poll = new PollPage();
    await location.find({
        $and: [
            { budget: { $eq: req.body.budget } },
            { category: { $eq: req.body.category } }
        ]
    }). then(function(response)
    {
        if(response.length == 0)
        {
            res.send("No matches found");
        }
        else 
        {
            for(let i = 0; i < response.length; i++)
            {
                createPoll(response[i], req.body.linkId);
            }
            res.send(response);
        }           
    });

});

// Updates votes and members of existing Poll
router.put("/vote/update", async (req, res) => {

    await PollPage.findOneAndUpdate({
        $and: [
            { linkId: { $eq: req.body.linkId } },
            { locationId: { $eq: req.body.locationId} }
        ]
    }, 
    {
        $inc : {"votes" : 1},
        $push : {"members" : req.body.memberName}

    }). then( function() {
        res.send("Updated Poll");
    })

});

router.get("/testPollPage", function(req, res) {
    res.send("Hello PollPage");

});

module.exports = router;