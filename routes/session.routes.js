// express stuff
const express = require('express');
const { cookie } = require('express/lib/response');
const router = express.Router();

// models
const Session = require("../models/session.model");
const User = require("../models/user.model");

// utility function -> generate random ID
const createSessionID = function () {
    return Math.random().toString(36).substring(2,7)
};

// CREATE NEW SESSION (User Presses generatelink)
// link_ID -> internal SESSION generated link_ID
// linkID -> value being sent to DB
// user_ID -> internal SESSION generated user_ID
// userID -> value being sent to DB
router.post("/", async (req, res) => {

    // create session ID
    const link_ID = createSessionID();

    // create User
    const newUser = new User({
        linkID: link_ID,
        userName: req.body.name,
        creator: true
    })

    // add User to collection
    await newUser.save((err, data) => {
        if (err) {
            res.status(500).json(data);
            throw err;
        }
    });

    // create Session 
    const newSession = new Session({
        linkID: link_ID,
        names: newUser,
        budget: req.body.budget,
        activities: req.body.activities
    });

    // add Session to collection
    await newSession.save((err, data) => {
        if (err) {
            res.status(500).json(data);
            throw err;
        }

        // set cookies
        res.cookie('userID', String(newUser._id), {maxAge: 172800000});
        res.cookie('sessionID', String(link_ID), {maxAge: 172800000});
        res.cookie('creator', 'true', {maxAge: 172800000});
    
        res.status(200).json(data).send();
    });   
    
    // add reroute to created session
});

// Add new User to existing poll
router.put("/:id", async (req, res) => {

    // get data from request headers
    link_ID = req.params.id;

    // see if Session exists 
    const sessionExists = await Session.exists({ linkID : "af2ca" });
    console.log(sessionExists);
    
    // if session doesn't exist
    if (!sessionExists) {
        res.status(403);
        res.json({ "shoi": "na mama hoilo na beparta" }).send(sessionExists);
        throw err;
    }

    // if session does exist
    const newUser = new User({
        linkID: link_ID,
        userName: req.body.name,
        creator: false
    });

    // add User to collection
    await newUser.save((err, data) => {
        if (err) {
            throw err;
        }
    });

    // find Session by ID and add new User to names
    await Session.findOneAndUpdate(
        { linkID: link_ID },
        { $push: { names: newUser } }
    );

    // set cookies
    res.cookie('userID', String(newUser._id), { maxAge: 172800000 });
    res.cookie('sessionID', String(link_ID), { maxAge: 172800000 });
    res.cookie('creator', 'false', { maxAge: 172800000 });

    res.status(200).json({ "shoi": "mama beparta bhalo laglo" }).send();
});

// Method to update users parameters
router.delete("/:id", async (req, res) => {
    
    // get data from request headers
    link_ID = req.params.id;

    // see if Session exists

    // find User by using linkID
    await User.findOne(
        { linkID : link_ID }, (err, data) => {
            user_ID = data._id;
        }
    );

    // remove User from collection
    await User.deleteOne( 
        { _id : user_ID }
    );

    // remove User from Session
    await Session.findOneAndDelete(
        { linkID : link_ID },
        { $pop   : { names : user_ID } }
    );

    // remove cookies
    res.clearCookie('userID');
    res.clearCookie('sessionID');
    res.clearCookie('creator');

    res.status(200).send("User deleted");
});

module.exports = router;

// { linkID : "af2ca" }