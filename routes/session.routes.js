// express
const express = require('express');
const router = express.Router();

// models
const Session = require("../models/session.model");
const User = require("../models/user.model");

// utility function -> generate random ID
const createID = function () {
    return Math.random().toString(36).substring(2,7)
};

// CREATE NEW SESSION (User Presses generatelink)
// link_ID -> internal SESSION generated link_ID
// linkID -> value being sent to DB
// same for user_ID and userID
router.post("/", async (req, res) => {

    // create session ID
    const link_ID = createID();
    // create user ID
    const user_ID = createID();

    // create User
    const newUser = new User({
        linkId: link_ID,
        userName: req.body.names,
        userId: user_ID,
        creator: true
    })

    // add User to collection
    await newUser.save((err, data) => {
        if (err) {
            throw err;
        }
    });

    // create Session 
    const newSession = new Session({
        names: newUser,
        linkID: link_ID,
        budget: req.body.budget,
        activities: req.body.activities
    });

    // add Session to collection
    newSession.save((err, data) => {
        if (err) {
            throw err;
        }   
        res.cookie("userID", user_ID);
        res.json(data); 
    });   

    // add reroute to create session
});

// Add new User to existing poll
router.put("/:id", async (req, res) => {

    // get data from request headers
    link_ID = req.params.id;

    // create user ID
    user_ID = createID();

    // create User
    const newUser = new User({
        linkId: link_ID,
        userName: req.body.name,
        userId: user_ID,
        creator: false
    });

    // add User to collection
    await newUser.save((err, data) => {
        if (err) {
            throw err;
        }
    })

    // find Session by ID and add new User to names
    await Session.findOneAndUpdate( 
        { linkID : link_ID },
        { $push : { names : newUser } }
    );
    res.cookie("userID", user_ID);
    console.log('Added User and Parameters');
    res.send('Added User')
});

// Method to update users parameters
router.delete("/:id", async (req, res) => {
    
    // get data from request headers
    link_ID = req.params.id;

    userName = req.body.name;

    // remove User from collection
    await User.deleteOne( 
        { linkID: link_ID }
    );

    res.send('Deleted User and Parameters');
});

module.exports = router;