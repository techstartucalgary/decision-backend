const express = require('express');
const PollPage = require("../models/pollPage.model");
const Location = require("../models/locations.model");
const Session = require("../models/session.model");
const User = require("../models/user.model");

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


// returns user's votes given userID
// async function findUserVotes(userId)
// {
//     await User.findOne({
//         userId: { $eq: userId }  
//     }). then(function(response)
//     {
//        //  console.log(response);
//         return response;

//     })
// }


// update user's location votes
function updateUserVotes(userID, locationIDs) 
{
    User.findOneAndUpdate({
        userId: { $eq: userID }  
    }, 
    {
        $push : {locationVotes: {$each: locationIDs}}
    },
    function(err, result) {
        if(err)
        {
            return false;
        }
        else
        {
            return true;
        }
    })

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

    var locIds = req.body.locationIds;
    var validLocations = [];

    // find valid locations
    await User.findOne({
        $and: [
            { linkId: { $eq: req.params.id } },
            { userId: { $eq: req.body.userId } }, 
        ],  
    }). then(function(response) 
    {
        // console.log("Location Votes:")
        // console.log(response.locationVotes);
        if(response == null)
        {
            res.send("Cannot find User");
        }
        else
        {
            // console.log(response);
            if(response.locationVotes.length == 0)
            {
                validLocations = req.body.locationIds;
            }
            else
            {
                var check = false;
                // console.log(locIds[0] == response.locationVotes[0]);
                for(let i = 0; i < locIds.length; i++)
                {
                    for(let j = 0; j < response.locationVotes.length; j++)
                    {
                        if(locIds[i] == response.locationVotes[j])
                        {
                            check = true;    
                        }
                    }
                    if(check == false)
                    {
                        validLocations.push(locIds[i]);
                    }
                    check = false;
                }
            }
            // console.log("Valid locations:");
            // console.log(validLocations);
        }

    })

    if(validLocations.length > 0)
    {
        // update user's location votes
        User.findOneAndUpdate({
            $and: [
                { linkId: { $eq: req.params.id } },
                { userId: { $eq: req.body.userId } }, 
            ],
        }, 
        {
            $push : {locationVotes: {$each: validLocations}}
        },
        function(err, result) {
            if(err)
            {
                res.send(err);
            }
        })
        
        // update votes of valid locations in pollPage
        PollPage.updateMany({
            $and: [
                { linkId: { $eq: req.params.id } },
                { locationID: { $in: validLocations } }, 
            ],
        },
        {
            $inc : {votes: 1}
        },
        function(err, result) {
            if(err)
            {
                res.send(err);
            }
        })
        res.send("Votes Added");
    }
    else
    {
        res.send("You have already voted for one or more locations");
    }
});

// Deletes members and updates vote count of existing Poll given linkID
router.put("/:id/deleteVotes", async (req, res) => {

    var locIds = req.body.locationIds;
    var validLocations = [];

    // match locations
    await User.findOne({
        $and: [
            { linkId: { $eq: req.params.id } },
            { userId: { $eq: req.body.userId } }, 
        ],  
    }). then(function(response) 
    {
        // console.log("Location Votes:")
        // console.log(response.locationVotes);
        if(response == null)
        {
            res.send("Cannot find User");
        }
        else
        {
            // console.log(response);
            if(response.locationVotes.length == 0)
            {
                res.send("Cannot delete votes");
            }
            else
            {
                var check = false;
                // console.log(locIds[0] == response.locationVotes[0]);
                for(let i = 0; i < locIds.length; i++)
                {
                    for(let j = 0; j < response.locationVotes.length; j++)
                    {
                        if(locIds[i] == response.locationVotes[j])
                        {
                            check = true;  
                        }
                    }
                    if(check == true)
                    {
                        validLocations.push(locIds[i]);
                    }
                    check = false;
                }
            }
            // console.log("Valid locations:");
            // console.log(validLocations);
        }
    })

    // update user's location votes
    User.findOneAndUpdate({
        $and: [
            { linkId: { $eq: req.params.id } },
            { userId: { $eq: req.body.userId } }, 
        ],
    }, 
    {
        $pull : {locationVotes: {$in: validLocations}}
    },
    function(err, result) {
        if(err)
        {
            res.send(err);
        }
    })
    
    // update votes of valid locations in pollPage
    PollPage.updateMany({
        $and: [
            { linkId: { $eq: req.params.id } },
            { locationID: { $in: validLocations } }
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