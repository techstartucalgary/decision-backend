const express = require('express');
const session = require("./database/models/session.js");

var router = express.Router();

router.get("/:session", (req, res) => {


});

router.post("/:session", (req, res) => {
    
    const name = req.body.name;
    const linkID = createID();
    const budget = req.body.budget;
    const activities = req.body.activities;

    const newSession = new session({
        name,
        linkID,
        budget,
        activities,
    });

    newSession
        .save()
        .then(() => res.json(newSession.linkID))
        .catch((err) => res.status(400).json("Error: " + err));

});