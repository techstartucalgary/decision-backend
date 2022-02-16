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
    category: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('Location', locationSchema);
