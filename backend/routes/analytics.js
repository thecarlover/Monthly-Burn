const express = require('express');
const router = express.Router();
const { calculateBurnScore, getSmartInsights } = require('../services/insightsService');
const Expense = require('../models/Expense');
const Subscription = require('../models/Subscription');

router.get('/', async (req, res) => {
    try {
        const userId = req.user._id;

        const expenses = await Expense.find({ userId });
        const subscriptions = await Subscription.find({ userId, isActive: true });

        const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const essentialSpend = expenses.filter(e => e.category === 'Essential').reduce((sum, e) => sum + e.amount, 0);
        const nonEssentialSpend = expenses.filter(e => e.category === 'Non-Essential').reduce((sum, e) => sum + e.amount, 0);

        const burnScore = await calculateBurnScore(userId);
        const insights = await getSmartInsights(userId);

        const subscriptionCost = subscriptions.reduce((sum, s) => sum + s.cost, 0);

        res.json({
            totalSpend,
            essentialSpend,
            nonEssentialSpend,
            burnScore,
            insights,
            subscriptionCost,
            topWasteAreas: insights.slice(0, 3),
            savingsPotential: Math.round(nonEssentialSpend * 0.3)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
