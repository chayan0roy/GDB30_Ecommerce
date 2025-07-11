const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    profileImage: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = {User};