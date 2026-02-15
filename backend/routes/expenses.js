const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');

// Get all expenses for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user._id;
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new expense
router.post('/', async (req, res) => {
    try {
        const { amount, category, subcategory, description, date, isRecurring } = req.body;
        const newExpense = new Expense({ userId: req.user._id, amount, category, subcategory, description, date, isRecurring });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!expense) return res.status(404).json({ message: 'Expense not found or unauthorized' });
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an expense
router.patch('/:id', async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['amount', 'category', 'subcategory', 'description', 'date', 'isRecurring'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }

        res.json(expense);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Reset all expenses for the user
router.post('/reset', async (req, res) => {
    try {
        await Expense.deleteMany({ userId: req.user._id });
        res.json({ message: 'All expenses cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
