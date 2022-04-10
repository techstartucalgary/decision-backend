const mongoose = require('mongoose');
const userSchema = require('../models/user.model').schema;

const sessionSchema = new mongoose.Schema({

    linkId: {
        type: String,
        require: true,
    },
    userId: {
        type: String,
        require: true,
    },
    names: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
})

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;