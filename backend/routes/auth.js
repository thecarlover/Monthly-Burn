const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_for_production';

// Public: Get total user count
router.get('/users/count', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error fetching user count:', error);
        res.status(500).json({ message: 'Error fetching user count' });
    }
});

// Google Login / Register
router.post('/google', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                googleId,
                email,
                displayName: name,
                authMethod: 'google'
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.authMethod = 'google';
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
});

// Email/Password Register
router.post('/register', async (req, res) => {
    const { email, password, displayName } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            email,
            password: hashedPassword,
            displayName,
            authMethod: 'local'
        });

        await user.save();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Email/Password Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Middleware to verify JWT
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).send({ error: 'Please authenticate.' });
        }

        // DEVELOPMENT ONLY: Allow mock_token for demo
        if (token === 'mock_token' && process.env.NODE_ENV !== 'production') {
            let user = await User.findOne({ email: 'demo@example.com' });
            if (!user) {
                user = new User({
                    email: 'demo@example.com',
                    displayName: 'Demo User',
                    googleId: 'mock_google_id'
                });
                await user.save();
            }
            req.user = user;
            req.token = token;
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        console.error('Authentication error:', e.message || 'User not found in database');
        res.status(401).send({ error: e.message || 'Please authenticate.' });
    }
};

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    res.send(req.user);
});

// Update Profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['displayName', 'monthlyIncome', 'currency', 'notificationsEnabled', 'email', 'salaryCreditDate'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach((update) => {
            // Only update email if it's different and we actually want to allow email changes (currently just ignoring to pass validation)
            if (update !== 'email') {
                req.user[update] = req.body[update];
            }
        });
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        console.error('Profile Update Error:', e);
        res.status(400).send(e);
    }
});

// Change Password
router.patch('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (req.user.authMethod === 'google') {
        return res.status(400).send({ error: 'Google users cannot change passwords here.' });
    }

    try {
        const isMatch = await bcrypt.compare(currentPassword, req.user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Current password incorrect' });
        }

        req.user.password = await bcrypt.hash(newPassword, 10);
        await req.user.save();
        res.send({ message: 'Password updated successfully' });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete account
router.delete('/profile', auth, async (req, res) => {
    try {
        await req.user.deleteOne();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

// Get custom categories
router.get('/categories', auth, async (req, res) => {
    res.send(req.user.customCategories || []);
});

// Add custom category
router.post('/categories', auth, async (req, res) => {
    const { name, type, iconName } = req.body;
    if (!name || !type) {
        return res.status(400).send({ error: 'Name and type are required' });
    }

    // Check for duplicates
    const exists = req.user.customCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return res.status(400).send({ error: 'Category already exists' });
    }

    req.user.customCategories.push({ name, type, iconName: iconName || 'Zap' });
    await req.user.save();
    res.status(201).send(req.user.customCategories);
});

module.exports = { router, auth };
