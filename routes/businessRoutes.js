require('dotenv').config();

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const { registerBusiness, loginBusiness, newToMenu, updateBusiness, updateMenu } = require('../controller/businessController');

const tokenValidator = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    try {
        const user = jwt.decode(token, process.env.BUS_SECRET);
        if (user.userType !== 'business' || !user.userType ) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}

router.post('/register', registerBusiness);
router.post('/login', loginBusiness);
router.post('/menu-update', tokenValidator, newToMenu);
router.patch('/shop-update', tokenValidator, updateBusiness);
router.patch('/item-update', tokenValidator, updateMenu);

module.exports = router;