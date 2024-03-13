const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail, // Uses validator's isEmail method
            message: 'This is not a valid email address'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin'
    }
}, { timestamps: true} );

adminSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 12);
        }
        next();
    } catch (err) {
        next(err);
    }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
