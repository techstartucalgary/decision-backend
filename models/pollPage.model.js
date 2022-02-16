const mongoose = require('mongoose')


var pollPageSchema = new mongoose.Schema ({

    linkId: {
        type: String,
        require: true
    },
    locationId: {
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
    }
})

module.exports = mongoose.model('PollPage', pollPageSchema);