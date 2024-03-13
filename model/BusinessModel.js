const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const businessSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: [true, 'Shop name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required for business registration'],
        unique: [true, 'Email already exists'],
        validate: {
            validator: validator.isEmail, // Uses validator's isEmail method
            message: 'This is not a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required for business registration']
    },
    address: {
        type: String,
        required: [true, 'Address is required for business registration']  
    },
    city: {
        type: String,
        required: [true, 'City is required for business registration'],
    },
    location: {
        latitude: {
            type: Number,
            required: [false, 'Latitude is required for business registration']
        },
        longitude: {
            type: Number,
            required: [false, 'Longitude is required for business registration']
        }
    },
    phone: {
        type: String,
        minlength: [10, 'Phone number must be at least 10 digits long'],
        maxlength: [10, 'Phone number must be at most 10 digits long'],
        required: [true, 'Phone number is required for business registration'],
        unique: [true, 'Phone number already exists'],
        validate: {
            validator: validator.isNumeric, // Use isNumeric method from validator package
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required for business registration']
    },
    menu: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foods'
    }]
}, { timestamps : true });

businessSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

const Business = mongoose.model('Businesses', businessSchema);
module.exports = Business;