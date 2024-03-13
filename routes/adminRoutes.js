const express = require('express');
const router = express.Router();

const Admin = require('../model/adminModel');
const Business = require('../model/BusinessModel');
const User = require('../model/UserModel');
const Food = require('../model/FoodModel');
const Review = require('../model/ReviewsModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin verification middleware
const verifyAdmin = async (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({
            success: false,
            message: 'Access denied'
        });
    }
    try {
        const decoded = jwt.decode(token, process.env.ADMIN_SECRET);
        if (decoded.userType !== 'admin') {
            console.log('User type is not admin');
            return res.status(401).json({
                success: false,
                message: 'Access denied'
            });
        }
        const admin = await Admin.findOne({ _id: decoded.userId });
        if (!admin) {
            throw new Error();
        }
        req.token = token;
        req.admin = admin;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({
            success: false,
            message: 'Access denied'
        });
    }
};

// Admin token generation function
const generateAdminToken = (admin) => {
    const token = jwt.sign({ 
        userId: admin._id,
        userType: 'admin'
    }, process.env.ADMIN_SECRET, { expiresIn: '1h' });
    return token;
};

// Admin login route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
        const admin = new Admin({ username, password, email });
        await admin.save();

        const token = generateAdminToken(admin);

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(201).json({
            success: true,
            data : admin
        });
    }
    catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username && !email) {
        return res.status(400).json({
            success: false,
            message : 'Please provide username or email'
        });
    }
    const finder = username ? { username } : { email };
    try {
        const admin = await Admin.findOne(finder);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message : 'Admin not found'
            });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json('Invalid password');
        }

        const token = generateAdminToken(admin);

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Admin create food route
router.post('/create-food', verifyAdmin, async (req, res) => {
    const shopId = req.query.shopId;
    try {
        const food = new Food({...req.body, shop: shopId});
        await food.save();
        res.status(201).json({
            success: true,
            data: food
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// Admin create business route
router.post('/create-business', verifyAdmin, async (req, res) => {
    try {
        const business = new Business(req.body);
        await business.save();
        res.status(201).json({
            success: true,
            data: business
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// Admin create user route
router.post('/create-user', verifyAdmin, async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// Admin dashboard route
router.patch('/update-business', verifyAdmin, async (req, res) => {
    const { businessId } = req.query;
    try {
        const business = await Business.findByIdAndUpdate(businessId, req.body, { new: true });
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not updated'
            });
        }
        res.status(200).json({
            success: true,
            data: business
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Admin create user route
router.patch('/update-review', verifyAdmin, async (req, res) => {
    const { reviewId } = req.query;
    try {
        const review = await Review.findByIdAndUpdate(reviewId, req.body, {
            new: true
        });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Admin update user route
router.patch('/update-user', verifyAdmin, async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findByIdAndUpdate(userId, req.body, {
            new: true
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Admin delete business route
router.delete('/remove-business', verifyAdmin, async (req, res) => {
    const { businessId } = req.query;
    try {
        const business = await Business.findByIdAndDelete(businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }
        res.status(200).json({
            success: true,
            data: business
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Admin delete user route
router.delete('/remove-user', verifyAdmin, async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Admin delete review route
router.delete('/remove-review', verifyAdmin, async (req, res) => {
    const { reviewId } = req.query;
    try {
        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Admin delete food route
router.delete('/remove-food', verifyAdmin, async (req, res) => {
    const { foodId } = req.query;
    try {
        const food = await Food.findByIdAndDelete(foodId);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food not found'
            });
        }
        res.status(200).json({
            success: true,
            data: food
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.get('/businesses', verifyAdmin, async (req, res) => {
    try {
        const businesses = await Business.find().
        populate({
            path : 'menu',
            populate : ({
                path : 'reviews',
                model : 'Reviews',
                populate : ({
                    path : 'writer',
                    model : 'Users'
                })
            })}).
            select('-password');
        res.status(200).json({
            success: true,
            data: businesses
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;