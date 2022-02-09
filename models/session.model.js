const mongoose = require('mongoose')

var sessionSchema = new mongoose.Schema({
    linkID: {
        type: String,
        require: true,
        unique: true,
    },
    names: [{
        type: String,
        require: true,
        unique: false
    }],
    budget: [{
        type: String,
        require: true,
        unique: false
    }],
    activities: [{
        type: String
    }]
})

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;