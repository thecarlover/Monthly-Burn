const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    billingCycle: { type: String, enum: ['Monthly', 'Yearly'], default: 'Monthly' },
    nextRenewal: { type: Date },
    usageFrequency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
