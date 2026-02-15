const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: ['Essential', 'Non-Essential'], required: true },
    subcategory: { type: String, required: true }, // Rent, Groceries, Food Ordering, etc.
    description: { type: String },
    date: { type: Date, default: Date.now },
    isRecurring: { type: Boolean, default: false },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
