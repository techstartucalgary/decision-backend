// express stuff
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
// user_ID -> internal SESSION generated user_ID
// userID -> value being sent to DB
router.post("/", async (req, res) => {

    // create session ID
    const link_ID = createID();
    // create user ID
    const user_ID = createID();

    // create User
    const newUser = new User({
        linkID: link_ID,
        userName: req.body.names,
        userID: user_ID,
        creator: true
    })

    // add User to collection
    await newUser.save((err, data) => {
        if (err) {
            throw err;
        }
        // testing stuff
        console.log("New User created");
        console.log(data);
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
        // testing stuff
        console.log("New Session created");
        console.log(data);

        res.json(data.linkID);
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
        linkID: link_ID,
        userName: req.body.name,
        userID: user_ID,
        creator: false
    });

    // add User to collection
    await newUser.save((err, data) => {
        if (err) {
            throw err;
        }
        res.json(data);
    })

    // find Session by ID and add new User to names
    await Session.findOneAndUpdate( 
        { linkID : link_ID },
        { $push : { names : newUser } }
    );

    console.log('Added User and Parameters');
});

// Method to update users parameters
router.delete("/:id", async (req, res) => {
    
    // get data from request headers
    link_ID = req.params.id;

    user_Name = req.body.name;
    user_ID = req.body.ID;

    // remove User from collection
    await User.deleteOne( 
        { userID : user_ID }
    );

    // testing stuff
    console.log("User deleted");
    console.log(user_Name);

    // remove User from Session
    await Session.findOneAndDelete(
        { linkID : link_ID },
        { $pop   : { names : user_ID } }
    );

    // testing stuff
    console.log("User removed from Session");
    console.log(userName);

    res.send('Deleted User and Parameters');
});

module.exports = router;

// { linkID : "0dqn4" }