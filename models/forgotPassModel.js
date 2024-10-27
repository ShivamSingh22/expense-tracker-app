const mongoose = require('mongoose'); // Import mongoose

const forgotPasswordSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    expiresby: {
        type: Date,
        required: true
    }
});

const ForgotPassword = mongoose.model('ForgotPasswordRequest', forgotPasswordSchema); // Create model

module.exports = ForgotPassword;
