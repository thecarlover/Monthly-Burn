require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chrono-whirlpool';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const { router: authRouter, auth } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/expenses', auth, require('./routes/expenses'));
app.use('/api/subscriptions', auth, require('./routes/subscriptions'));
app.use('/api/analytics', auth, require('./routes/analytics'));

app.get('/', (req, res) => {
    res.send('Know Your Monthly Burn API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
