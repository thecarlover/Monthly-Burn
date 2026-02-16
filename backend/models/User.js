const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google users
    authMethod: { type: String, enum: ['local', 'google'], default: 'local' },
    displayName: { type: String },
    monthlyIncome: { type: Number, default: 0 },
    currency: { type: String, default: '₹' },
    notificationsEnabled: { type: Boolean, default: true },
    salaryCreditDate: { type: Number, default: 1, min: 1, max: 31 },
    savingStreak: { type: Number, default: 0 },
    lastUnderBudgetDay: { type: String }, // Stores YYYY-MM-DD
    customCategories: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['Essential', 'Non-Essential'], required: true },
        iconName: { type: String, default: 'Zap' }
    }],
    salaryMode: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
