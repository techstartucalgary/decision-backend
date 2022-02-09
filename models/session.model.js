const mongoose = require('mongoose')

var sessionSchema = new mongoose.Schema({

    linkID: {
        type: String,
        require: true,
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
        type: String,
    }],
    userID: {
        type: String,
        unique: true,
    }
})

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;