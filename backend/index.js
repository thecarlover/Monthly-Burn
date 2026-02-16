const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5001;


// Base Security
app.disable('x-powered-by'); // Hide that we use Express
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "connect-src": ["'self'", "http://localhost:5001", "http://localhost:5005"],
        },
    },
})); // Sets various HTTP headers for security
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
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5005'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://iamcarlover6505_db_user:xiiTaLPK8suoUby8@clustermain.nbs8257.mongodb.net/';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const { router: authRouter, auth } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/expenses', auth, require('./routes/expenses'));
app.use('/api/subscriptions', auth, require('./routes/subscriptions'));
app.use('/api/analytics', auth, require('./routes/analytics'));

const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));
app.get('/health', (req, res) => {
    res.send('Know Your Monthly Burn API is running...');
});

// Catch-all route for SPA
app.use((req, res) => {
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ message: "API route not found" });
    }
    const indexPath = path.join(frontendDistPath, "index.html");
    console.log(`Catch-all serving: ${indexPath} for ${req.url}`);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error(`Error sending index.html: ${err.message}`);
            if (!res.headersSent) {
                res.status(500).send({ error: "Failed to serve frontend", details: err.message });
            }
        }
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
