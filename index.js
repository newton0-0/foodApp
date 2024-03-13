require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const businessRoutes = require('./routes/businessRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const port = process.env.PORT || 3000;

const app = express();

// Security considerations:
// 1. Use helmet middleware to set various HTTP headers for security
const helmet = require('helmet');
app.use(helmet());

// 2. Implement rate limiting to prevent abuse and DoS attacks
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// 4. Use secure cookies with appropriate settings
const cookieParser = require('cookie-parser');
app.use(cookieParser('secret'));

// Define other routes and middleware
app.use(express.json());

app.use('/business', businessRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

mongoose.connect(process.env.mongoUri).then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Server listening at ${port}`);
    });
}).catch(err => {
    console.log('Could not connect to MongoDB');
    console.log(err);
    process.exit(1);
});

// Custom error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json(err);
});