const express = require('express');
const PollPage = require("../models/pollPage.model");
const Location = require("../models/locations.model");
const Session = require("../models/session.model");

var mongo = require('mongodb').MongoClient;

var router = express.Router();


// creates a new Poll document given locaion and link IDs
function createPoll(loc, id)
{
    const poll = new PollPage ( {
        linkId: id,
        locationId: loc._id,
        locationName: loc.locationName

    });
    poll.save();
}

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

// returns the polls of given linkID
router.get("/:id/getPolls", async (req, res) => {

    await PollPage.find({
            linkId: { $eq: req.params.id }
    }). then( function(response) {
        res.send(response);
    })
});

// Finds matching locations given linkID, creates the matching location polls and returns all polls
router.get("/:id/createPolls", async (req, res) => {

    var session = await getSession(req.params.id);
    var categories = session.activities;
    var b = session.budget;

    let poll = new PollPage();
    await Location.find({
        $and: [
            { budget: { $eq: b[0] } },
            { category: { $in: categories } }
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
                createPoll(response[i], req.params.id);
            }
            res.send(response);
        }           
    });

});


// Adds/Updates vote count and members of existing Poll
router.put("/:id/addVotes", async (req, res) => {
    
    var locations = req.body.locationIds;
    
    for(let i = 0; i < locations.length; i++)
    {
        PollPage.findOneAndUpdate({
        $and: [
            { linkId: { $eq: req.params.id } },
            { locationId: { $eq: locations[i] } }
        ] 
    },
    {
        $inc : {"votes" : 1},
        $push : {"members" : req.body.memberName}
    }, function(err, result) {
        if(err)
        {
            res.send(err);
        }
    })
    }
    
    // the code below sometimes fails to return updated polls, use another endpoint to retrieve most updated polls 
    PollPage.find({
            linkId: { $eq: req.params.id }
    }). then( function(response) {
        res.send(response);
    })


});

// Deletes members aand updates vote count of existing Poll given linkID
router.put("/:id/deleteVotes", async (req, res) => {
    
    var locations = req.body.locationIds;
    
    for(let i = 0; i < locations.length; i++)
    {
        PollPage.findOneAndUpdate({
            $and: [
                { linkId: { $eq: req.params.id } },
                { locationId: { $eq: locations[i] } }
            ] 
        },
        {
            $inc : {"votes" : -1},
            $pull : {"members" : req.body.memberName}
        }, function(err, result) {
            if(err)
            {
                res.send(err);
            }
        })
    }
    
    // the code below sometimes fails to return updated polls, use another endpoint to retrieve most updated polls 
    PollPage.find({
            linkId: { $eq: req.params.id }
    }). then( function(response) {
        res.send(response);
    })


});


// Tests router
router.get("/testPollPage", function(req, res) {
    res.send("Hello PollPage");

});

module.exports = router;