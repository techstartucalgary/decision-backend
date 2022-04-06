// express
const express = require('express');
const router = express.Router();
const {Client, PlaceInputType} = require("@googlemaps/google-maps-services-js");

// models
const Session = require("../models/session.model");
const User = require("../models/user.model");
const PollPage = require("../models/pollPage.model");

const { response } = require('express');
const { location } = require('express/lib/response');

const googleClient = new Client({});

// utility function -> generate random ID
const createID = function () {
    return Math.random().toString(36).substring(2,7)
};


router.get("/testApi", async (req, res) =>{
    var cat = ["Shopping", "Cafe"];
    var location_data = await getLocationIDs(cat, 2);
    console.log(location_data);
    var location_details = await getPlaceDetails(location_data);
    res.send("Done");
    console.log("Locations:");
    console.log(location_details);


    
})

const getLocationIDs = async function (categories, budget) {

    var placeIds = [];
    // var priceLevels = [];
    var params = {
        input: "",
        minPriceLevel: 0,
        maxPriceLevel: 0,
        openNow: true,
        key: process.env.API_KEY,
    };

    var r = [];

    for(let i = 0; i < categories.length; i++)
    {
        params = {
            input: categories[i],
            minPriceLevel: 0,
            maxPriceLevel: budget,
            openNow: true,
            key: process.env.API_KEY,
        }

        r = await googleClient.textSearch({ 
            params: params,
            timeout: 1000
        });

        var info = r.data.results;
    
        var placeIDs = r.data.results.map(function(inputs) {
            return inputs.place_id;
        })

        if(info.length > 3)
        {
            placeIDs.splice(3, placeIDs.length-1);
        //    //  price_levels.splice(3, price_levels.length-1);
            placeIds.push(placeIDs);
            // priceLevels.push(price_levels);
            // info.splice(3, info.length-1);
            // placeIds.push(info);
        }
        else
        {
            placeIds.push(placeIDs);
            // priceLevels.push(price_levels);
            // placeIds.push(info);
        }
        
        // console.log(r.data);

    }
    // console.log("HELLO");
    // console.log(placeIds);
    // console.log(r.data);
    // var info = [placeIds, priceLevels]
    return placeIds;

};

const getPlaceDetails = async function (place_ids) {

    var locationDetails = [];

    var params = {
        placeid: '',
        fields: ["name", "price_level", "place_id", "formatted_address", "rating", "types", "website", "reviews"],
        key: process.env.API_KEY
    }

    var r = [];

    for(let i = 0; i < place_ids.length; i++)
    {
        var loc_details = [];
        var location = {
            locationName: '',
            locationID: '',
            budget: '',
            type: '',
            address: '',
            website: '',
            rating: '',
            reviews: ''
        }
        for(let j = 0; j < place_ids[i].length; j++)
        {
            params = {
                placeid: place_ids[i][j],
                fields: ["name", "price_level", "place_id", "formatted_address", "rating", "types", "website", "reviews"],
                key: process.env.API_KEY
            }
            r = await googleClient.placeDetails({
                params: params,
                timeout: 1000
            });
            location = {
                locationName: r.data.result.name,
                locationID: r.data.result.place_id,
                budget: r.data.result.price_level,
                type: r.data.result.types.toString(),
                address: r.data.result.formatted_address,
                website: r.data.result.website,
                rating: r.data.result.rating,
                reviews: r.data.result.reviews.length
            }
            // console.log(r.data.result);
            loc_details.push(location);
        }
        locationDetails.push(loc_details);
        
    }    
    // console.log(locationDetails);
    return locationDetails;
    // console.log(r.data)
}

// creates a new Poll document given location and link IDs
function createPoll(loc, id)
{
    const poll = new PollPage ( {
        linkId: id,
        locationID: loc.locationID,
        locationName: loc.locationName,
        locationDetails: loc,
    });
    poll.save();
}

// Method to update users parameters
router.delete("/deleteEverything/:id", async (req, res) => {
    
    // get data from request headers
    link_ID = req.params.id;

    // remove User from collection
    Session.deleteOne( 
        { linkID: { $eq: link_ID} }
    ).then (function(response) {

        console.log("deleted session");

    });

    // remove User from collection
    User.deleteOne( 
        { linkId: { $eq: link_ID} }
    ).then (function(response) {

        console.log("deleted user");

    });

    // remove User from collection
    PollPage.deleteOne( 
        { linkId: { $eq: link_ID} }
    ).then (function(response) {

        console.log("deleted pollpage");

    });

    res.send('Deleted Everything');
});



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

    var placeIds = await getLocationIDs(req.body.activities, req.body.budget);
    console.log("Place IDs:");
    console.log(placeIds);
    // console.log(placeIds.length);
    // console.log(placeIds[0].length);
    var location_details = await getPlaceDetails(placeIds);
    console.log("Location Details:");
    console.log(location_details);

    for(let i = 0; i < placeIds.length; i++)
    {
        for(let j = 0; j < placeIds[i].length; j++)
        {
            createPoll(location_details[i][j], link_ID);
        }
    }
    console.log("Done!");


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