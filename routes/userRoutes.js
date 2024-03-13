require('dotenv').config();

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const { registerUser, loginUser, submitReview } = require('../controller/userController');

const tokenValidator = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    try {
        const user = jwt.verify(token, process.env.USER_SECRET);
        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/review', tokenValidator, submitReview);

module.exports = router;