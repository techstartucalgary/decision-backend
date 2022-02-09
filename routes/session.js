const express = require('express');
const session = require("../models/session.model");

var router = express.Router();

const createID = function () {
    return Math.random().toString(36).substring(2,7)
};

// CREATE NEW SESSION (User presses generatelink)
router.post("/", async (req, res) => {
    
    console.log(req.body);
    const names = req.body.names;
    const linkID = createID();
    const budget = req.body.budget;
    const activities = req.body.activities;

    const newSession = new session({
        names,
        linkID,
        budget,
        activities,
    });
    try {
        newSession
        .save()
        .then(() => res.json(newSession.id))
    } catch(err) {
        res.status(400).json("Error: " + err)};

});


// Update 
router.put("/:linkID", (req, res) => {
    session.updateOne({ _id: req.params.linkID})
});






module.exports = router;

