const Users = require('../model/UserModel');
const Reviews = require('../model/ReviewsModel');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res, next) => {
    const newUser = new Users({
        ...req.body
    })
    try {
        const user = await newUser.save();

        const token = jwt.sign({ 
            userId: user._id,
            userType: 'user'
        }, process.env.USER_SECRET, { expiresIn: '1h' });

        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({
            success : true,
            data : user
        });
    } catch (error) {
        next(error);
    }
};


exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ email }).select('password');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }
        const token = jwt.sign({ 
            userId: user._id,
            userType: 'user'
        }, process.env.USER_SECRET, { expiresIn: '1h' });

        const userData = await Users.findById(user._id).select('-password');
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({
            success : true,
            data : userData
        });
    } catch (error) {
        next(error);
    }  
};

exports.submitReview = async (req, res, next) => {
    try {
        // Decode JWT token
        const user = jwt.decode(req.headers.authorization.split(' ')[1], process.env.USER_SECRET);

        // Validate request body
        const { foodId, rating, review } = req.body;
        if (!foodId || !rating || !review) {
            return res.status(400).json({ error: 'foodId, rating, and review are required fields' });
        }

        // Create new review object
        const newReview = new Reviews({
            foodId,
            rating,
            review,
            writer: user.userId
        });

        // Save review
        const savedReview = await newReview.save();

        res.status(201).json(savedReview);
    } catch (error) {
        next(error);
    }
};