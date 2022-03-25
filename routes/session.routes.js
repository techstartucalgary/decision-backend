// Express 
const express = require('express');
const { cookie } = require('express/lib/response');
const router = express.Router();

// Models
const Session = require("../models/session.model");
const User = require("../models/user.model");

// utility function -> generate random ID
const createRandomID = function () {
    return Math.random().toString(36).substring(2,7);
};

// CREATE NEW SESSION (User Presses generatelink)
// link_ID -> internal SESSION generated link_ID
// linkID -> value being sent to DB
// user_ID -> internal SESSION generated user_ID
// userID -> value being sent to DB
router.post("/", async (req, res) => {

    // create link ID
    const link_ID = createRandomID();
    // create user ID
    const user_ID = createRandomID();

    // create User
    const newUser = new User({
        linkID: link_ID,
        userID: user_ID,
        userName: req.body.names,
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
        res.cookie('linkID', String(link_ID), {maxAge: 172800000});
        res.cookie('userID', String(newUser.userID), {maxAge: 172800000});
        res.cookie('userName', String(newUser.userName), {maxAge: 172800000})
        res.cookie('creator', 'true', {maxAge: 172800000});
    
        res.status(200).json(newUser).send();
    });   
    
    // add reroute to created session

});

// Add new User to existing poll
router.put("/:id", async (req, res) => {

    // get data from request headers
    link_ID = req.params.id;
    
    // create user ID for new user
    user_ID = createRandomID();

    // debug statements
    console.log(link_ID);
    console.log(typeof link_ID);

    // see if Session exists 
    const sessionExists = await Session.exists({ linkID : link_ID });
    
    // if Session doesn't exist
    if (!sessionExists) {
        res.status(403);
        res.json({ "shoi": "na mama hoilo na beparta" });
    }
    else {
        // if Session exist
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
        });

        // incoming janky code because I couldn't seem to get Mongoose to update multiple documents at once
        // find Session by ID and add new User attributes to correct fields
        // add new User object
        await Session.findOneAndUpdate(
            { linkID: link_ID },
            { $push: { names: newUser }}
        );
        // add new User activity
        await Session.findOneAndUpdate(
            { linkID: link_ID },
            { $push: { activities: req.body.activities }}
        );

        // set cookies
        res.cookie('linkID', String(link_ID), { maxAge: 172800000 });
        res.cookie('userID', String(newUser.userID), { maxAge: 172800000 });
        res.cookie('userName', String(newUser.userName), {maxAge: 172800000});
        res.cookie('creator', 'false', { maxAge: 172800000 });

        res.status(200).json(newUser).send();
    }

});

// Method to update users parameters
router.delete("/:id", async (req, res) => {
    
    // get user_ID
    user_ID = req.cookies.userID;

    // see if User exists
    const userExists = await User.exists({userID : user_ID});
    console.log(userExists._id);

    // // if User doesn't exist
    // if(!userExists) {
    //     res.status(403);
    //     res.json({ "shoi": "na mama hoilo na beparta" });
    // }
    // // if User exists
    // else {
    //     await User.find({userID : user_ID}, (err, data) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //         console.log(data);
    //     })
    // }


    // remove cookies
    // res.clearCookie('linkID');
    // res.clearCookie('userID');
    // res.clearCookie('userName');
    // res.clearCookie('creator');

    res.status(200).send("working");
});

module.exports = router;

// { linkID : "5qh4h" }