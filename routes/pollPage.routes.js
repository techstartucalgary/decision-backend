const express = require('express');
const PollPage = require("../models/pollPage.model");
const Location = require("../models/locations.model");
const Session = require("../models/session.model");

var mongo = require('mongodb').MongoClient;

var router = express.Router();

// creates a new Poll document given location and link IDs
function createPoll(loc, id)
{
    const poll = new PollPage ( {
        linkId: id,
        locationID: loc._id,
        locationName: loc.locationName,
        locationDetails: loc

    });
    poll.save();
}

// finds and returns session given linkID
async function getSession(id)
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
    }). sort({votes: -1}).then( function(response) {
        res.send(response);
    })
});

// Finds matching locations given linkID, creates the matching location polls and returns all polls
router.post("/:id/createPolls", async (req, res) => {

    var session = await getSession(req.params.id);
    var categories = session.activities;
    var b = session.budget;
    var location;
    console.log(categories);
    let poll = new PollPage();
    await Location.find({
        $and: [
            { budget: { $eq: b[0] } },
            { type: { $in: categories } }
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

        console.log(req.body.locationIds);

        PollPage.updateMany({
        $and: [
            { linkId: { $eq: req.params.id } },
            { locationID: { $in: req.body.locationIds } }, 
        ],
    },
    {
        $inc : {votes: 1},
        $push : {"members" : req.body.memberName}
    },
    function(err, result) {
        if(err)
        {
            res.send(err);
        }
    })
    res.send("Votes Added");


});

// Deletes members and updates vote count of existing Poll given linkID
router.put("/:id/deleteVotes", async (req, res) => {
    
        PollPage.updateMany({
            $and: [
                { linkId: { $eq: req.params.id } },
                { locationID: { $in: req.body.locationIds } }
            ] 
        },
        {
            $inc : {"votes" : -1},
            $pull : {"members" : req.body.memberName}
        }, {
            new: true
        }, function(err, result) {
            if(err)
            {
                res.send(err);
            }
            else
            {
                res.send("Deleted votes");
            }
        })
    
    // the code below sometimes fails to return updated polls, use another endpoint to retrieve most updated polls 
    // PollPage.find({
    //         linkId: { $eq: req.params.id }
    // }). then( function(response) {
    //     res.send(response);
    // })
});

// returns the locationIDs given linkID
router.get("/:id/getIDsNames", async (req, res) => {

    await PollPage.find({
            linkId: { $eq: req.params.id }
    }, 'locationID locationName'). then( function(response) {
        // console.log(response)
        res.send(response);
    })
});

// returns the members given linkID
router.get("/:id/getMembers", async (req, res) => {

    await PollPage.find({
            linkId: { $eq: req.params.id }
    }, 'members'). then( function(response) {
        // console.log(response);
        res.send(response);
    })
});

// returns the members given linkID and locationId
router.get("/:id/:lid/getMembers", async (req, res) => {

    await PollPage.find({
        $and: [
            { linkId: { $eq: req.params.id } },
            { locationID: { $eq: req.params.lid } }
        ] 
    }, 'members'). then( function(response) {
        // console.log(response);
        res.send(response);
    })
});

// returns the votes given linkID
router.get("/:id/getVotes", async (req, res) => {

    await PollPage.find({
            linkId: { $eq: req.params.id }
    }, 'votes'). then( function(response) {
        // console.log(response);
        res.send(response);
    })
});

// returns the votes given linkID and locationId
router.get("/:id/:lid/getVotes", async (req, res) => {

    await PollPage.find({
        $and: [
            { linkId: { $eq: req.params.id } },
            { locationID: { $eq: req.params.lid } }
        ] 
    }, 'votes'). then( function(response) {
        // console.log(response);
        res.send(response);
    })
});


//Twilio
// Tests router
router.get("/testPollPage", function(req, res) {
    res.send("Hello PollPage");

});

module.exports = router;

//Generate feedback to how we did. if they enjoyed that place, what they liked what they didnt
// Twilio