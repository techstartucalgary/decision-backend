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

module.exports = mongoose.model('Location', locationSchema);
