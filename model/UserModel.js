const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps : true });

// Define middleware functions
userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

// Create the user model
const User = mongoose.model('Users', userSchema);
module.exports = User;