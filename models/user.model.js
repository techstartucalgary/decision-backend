const mongoose = require('mongoose');

var userSchema = new mongoose.Schema ({
        linkId: {
            type: String,
            require: true
        },

        userId: {
            type: String,
            require: true
        }
})

module.exports = mongoose.model('User', userSchema);