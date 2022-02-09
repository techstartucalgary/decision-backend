const express = require('express');
const { removeListener } = require('../models/session.model');
const session = require("../models/session.model");

var router = express.Router();

const createID = function () {
    return Math.random().toString(36).substring(2,7)
};

// CREATE NEW SESSION (User Presses generatelink)
router.post("/", async (req, res) => {

    const link = createID();

    const newSession = new session({
        names: req.body.names,
        linkID: link,
        budget: req.body.budget,
        activities: req.body.activities,
    });
    try {
        newSession
        .save()
        .then(() => res.json(newSession.linkID))
    } catch(err) {
        res.status(400).json("Error: " + err)};

});


// Add new User & Parameters to existing Session
router.put("/:id", async (req, res) => {

    await session.findOneAndUpdate( {linkID: req.params.id}, {
        $push: { 
            names: req.body.names,
            budget: req.body.budget,
            activities: req.body.activities,
        }
    })
    res.send('Added User and Parameters');

});

// Delete specific parameters
router.delete("/:id", async (req, res) => {

    await session.findOneAndUpdate( {linkID: req.params.id}, {
        $pull: { 
            names: req.body.names,
            budget: req.body.budget,
            activities: req.body.activities,
        }, 
    }, {
        multi: true
    })
    res.send('Deleted parameters');

});

//Not working. Most likely have to go with different schema
router.patch("/:id", async(req, res) => {

    const oldName = req.body.oldName;
    const oldBudget = req.body.oldBudget;
    const oldActivities = req.body.oldActivities;

    await session.findOneAndUpdate({linkID: req.params.id, names: oldName }, {
        $set: {
            names: req.body.newNames,
            budget: req.body.newBudget,
            activities: req.body.newActivities,
        }
    })
})




module.exports = router;

