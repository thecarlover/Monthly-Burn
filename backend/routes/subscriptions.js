const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// Get all subscriptions for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user._id;
        const subscriptions = await Subscription.find({ userId });
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new subscription
router.post('/', async (req, res) => {
    try {
        const { name, cost, billingCycle, nextRenewal, usageFrequency } = req.body;
        const newSubscription = new Subscription({ userId: req.user._id, name, cost, billingCycle, nextRenewal, usageFrequency });
        await newSubscription.save();
        res.status(201).json(newSubscription);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update subscription status
router.patch('/:id', async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
