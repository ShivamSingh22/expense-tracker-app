const mongoose = require('mongoose'); // Import mongoose

const userSchema = new mongoose.Schema({

    username: {
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
    },
    ispremiumuser: {
        type: Boolean,
        default: false
    },
    totalExpenses: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema); // Create model

module.exports = User;
