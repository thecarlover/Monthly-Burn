const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const app = express();
const PORT = process.env.PORT || 5001;


// Base Security
app.disable('x-powered-by'); // Hide that we use Express
app.use(helmet()); // Sets various HTTP headers for security
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
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

// app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
// app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "..", "frontend", "dist", "index.html"));
// })

app.get('/', (req, res) => {
    res.send('Know Your Monthly Burn API is running...');
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
