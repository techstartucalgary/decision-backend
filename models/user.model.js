const mongoose = require('mongoose');

// Define Schema userSchema 
const userSchema = new mongoose.Schema ({

        linkID: {
            type: String,
            require: true
        },
        userName: {
            type: String,
            min: 3,
            require: true
        },
        votes: {
            type: [String],
            require: false
        },
        creator: {
            type: Boolean
        }
        
});

// Create model User from Schema userSchema 
const User = mongoose.model('users', userSchema);

module.exports = User;