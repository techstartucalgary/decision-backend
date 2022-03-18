const mongoose = require('mongoose')


var locationSchema = new mongoose.Schema ({

    locationName: {
        type: String,
        require: true
    },
    budget: {
        type: Number,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    location: {
        type: String,
    },
    distance: {
        type: String,
    },
    description: {
        type: String,
    },
    rating: {
        type: Number,
    },
    reviews: {
        type: Number,
    }
    
})


var pollPageSchema = new mongoose.Schema ({

    linkId: {
        type: String,
        require: true
    },
    locationID: {
        type: String,
        require: true
    },
    locationName: {
        type: String,
        require: true
    },
    members: [{type: String}],
    votes: {
        type: Number,
        default: 0
    },
    locationDetails: {
        type: locationSchema
    }
})

module.exports = mongoose.model('PollPage', pollPageSchema);
// module.exports = mongoose.model('Location', locationSchema);