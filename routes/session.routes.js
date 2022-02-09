const express = require('express');
const session = require("../models/session.model");

var router = express.Router();

const createID = function () {
    return Math.random().toString(36).substring(2,7)
};

// CREATE NEW SESSION (User Presses generatelink)
router.post("/", async (req, res) => {

    const newSession = new session({
        names: req.body.names,
        linkID: createID(),
        budget: req.body.budget,
        activities: req.body.activities
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

// Method to update users parameters
router.patch("/:id", async (req, res) => {

    await session.findOneAndUpdate( {linkID: req.params.id}, {

    })

});




module.exports = router;

