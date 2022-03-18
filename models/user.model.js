const mongoose = require('mongoose');

// Define Schema userSchema 
const userSchema = new mongoose.Schema ({
        linkId: {
            type: String,
            require: true
        },
        userName: {
            type: String,
            min: 3,
            require: true
        },
        userId: {
            type: String,
            require: true
        },
        creator: {
            type: Boolean
        }
});

// Create model User from Schema userSchema 
const User = mongoose.model('users', userSchema);

module.exports = User;