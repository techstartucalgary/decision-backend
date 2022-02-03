const mongoose = require('mongoose')

var sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    linkID: {
        type: String,
        require: true
    },
    budget: {
        type: Number,
        require: true
    },
    activities:
        [{type: String}]
})

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;