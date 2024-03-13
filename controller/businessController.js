require('dotenv').config();

const Business = require('../model/BusinessModel');
const Foods = require('../model/FoodModel');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.registerBusiness = async (req, res, next) => {
    const newBusiness = new Business({
        ...req.body
    });
    try {
        const business = await newBusiness.save();

        const token = jwt.sign({ 
            userId: business._id,
            userType: 'business'
        }, process.env.BUS_SECRET, { expiresIn: '1h' });

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(201).json({
            success: true, 
            data: business
        });
    } catch (error) {
        next(error);
    }
};

exports.loginBusiness = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const business = await Business.findOne({ email }).select('password');
        if (!business) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }
        const isMatch = await bcrypt.compare(password, business.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }
        const token = jwt.sign({ 
            userId: business._id,
            userType: 'business'
        }, process.env.BUS_SECRET, { expiresIn: '1h' });

        const businessData = await Business.findById(business._id).select('-password').
            populate({
                path : 'menu', 
                populate : ({
                    path : "reviews",
                    model: "Reviews"
                })
            });
        const { password, ...data } = businessData._doc;

        let businessRating = 0;
        let priceSum = 0;
        await businessData.menu.map(food => {
            businessRating+=food.rating;
            priceSum+=food.price;
        });
        data.rating = businessRating / businessData.menu.length;
        data.priceForTwo = priceSum*2 / businessData.menu.length;

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({ 
            success: true,
            data: data,
        });
    } catch (error) {
        next(error);
    }
};

exports.newToMenu = async (req, res, next) => {
    const user = jwt.decode(req.headers.authorization.split(' ')[1], process.env.BUS_SECRET);
    console.log(user);
    if (!user || user.userType !== 'business') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        })
    }
    const newFood = new Foods({
        ...req.body,
        shop: user.userId
    });
    try {
        const food = await newFood.save();
        res.status(201).json(food);
    } catch (error) {
        next(error);
    }
};

exports.updateBusiness = async (req, res, next) => {
    const user = jwt.decode(req.headers.authorization.split(' ')[1], process.env.BUS_SECRET);
    try {
        const business = await Business.findByIdAndUpdate(user.userId, req.body, {
            new: true
        });
        res.status(200).json(business);
    } catch (error) {
        next(error);
    }
};

exports.updateMenu = async (req, res, next) => {
    const user = jwt.decode(req.headers.authorization.split(' ')[1], process.env.BUS_SECRET);
    
    if (user.userType !== 'business') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        })
    }
    try {
        const food = await Foods.findOneAndUpdate({
            _id: req.params.id,
            shop: user.userId
        }, {
            ...req.body
        });
        res.status(200).json(food);
    } catch (error) {
        next(error);
    }
};