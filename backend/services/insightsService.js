const Expense = require('../models/Expense');
const Subscription = require('../models/Subscription');

const calculateBurnScore = async (userId) => {
    const expenses = await Expense.find({ userId });
    const subscriptions = await Subscription.find({ userId, isActive: true });

    if (expenses.length === 0) return 0;

    const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const nonEssentialSpend = expenses
        .filter(exp => exp.category === 'Non-Essential')
        .reduce((sum, exp) => sum + exp.amount, 0);

    const subscriptionSpend = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);

    // Simple logic: 60% based on non-essential ratio, 40% based on subscription relative to total
    const nonEssentialRatio = (nonEssentialSpend / totalSpend) * 100;
    const subscriptionRatio = (subscriptionSpend / totalSpend) * 100;

    let score = (nonEssentialRatio * 0.6) + (subscriptionRatio * 0.4);
    return Math.min(Math.round(score), 100);
};

const getSmartInsights = async (userId) => {
    const expenses = await Expense.find({ userId });
    const subscriptions = await Subscription.find({ userId, isActive: true });

    const insights = [];

    // Food delivery detection
    const foodDeliverySpend = expenses
        .filter(exp => exp.subcategory.toLowerCase().includes('food') || exp.subcategory.toLowerCase().includes('delivery'))
        .reduce((sum, exp) => sum + exp.amount, 0);

    const grocerySpend = expenses
        .filter(exp => exp.subcategory.toLowerCase().includes('grocery'))
        .reduce((sum, exp) => sum + exp.amount, 0);

    if (foodDeliverySpend > 0 && foodDeliverySpend > grocerySpend * 1.5) {
        insights.push({
            id: 'food-delivery',
            title: 'Reduce Food Ordering',
            description: `You spent ₹${foodDeliverySpend} on food delivery this month — ${grocerySpend > 0 ? Math.round(foodDeliverySpend / grocerySpend) : 'many'}x your grocery spend. Preparing meals at home more often could save you significantly.`,
            potentialSavings: `₹${Math.round(foodDeliverySpend * 0.4)}`,
            iconType: 'Zap',
            category: 'Food'
        });
    }

    // Subscription check
    if (subscriptions.length > 3) {
        insights.push({
            id: 'subscriptions-limit',
            title: 'Review Active Plans',
            description: `You have ${subscriptions.length} active subscriptions costing ₹${subscriptions.reduce((s, sub) => s + sub.cost, 0)}/mo. Switching some to annual billing or cancelling unused ones could help.`,
            potentialSavings: `₹${Math.round(subscriptions.reduce((s, sub) => s + sub.cost, 0) * 0.2)}`,
            iconType: 'TrendingDown',
            category: 'Subscriptions'
        });
    }

    // Spending spikes
    const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgExpense = expenses.length > 0 ? totalSpend / expenses.length : 0;
    const spikes = expenses.filter(exp => exp.amount > avgExpense * 3);

    if (spikes.length > 0) {
        insights.push({
            id: 'spending-spikes',
            title: 'Spending Spikes Detected',
            description: `We detected ${spikes.length} spending spikes this month. These individual large purchases are the primary drivers of your high burn score.`,
            potentialSavings: `₹${Math.round(spikes.reduce((s, exp) => s + exp.amount, 0) * 0.5)}`,
            iconType: 'Target',
            category: 'Behavior'
        });
    }

    return insights;
};

module.exports = { calculateBurnScore, getSmartInsights };
