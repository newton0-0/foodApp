const mongoose = require('mongoose');

const Foods = require('./FoodModel');

const reviewSchema = new mongoose.Schema({
    writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'Name is required']
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foods',
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required']
    },
    review: {
        type: String,
        required:false
    },
    images: [{
        type: String,
        required: false
    }],
    responses: [{
        comment : {
            type: String,
            required: [true, 'something shall be there to comment, no?']
        },
        writer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        bussiness: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Businesses'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps : true });

// Middleware function to check if the provided writer, foodId exists or not before saving the review and updating the rating
reviewSchema.pre('save', async function(next) {
    try {
        const writer = await mongoose.model('Users').findById(this.writer);
        const food = await mongoose.model('Foods').findById(this.foodId);
        if (!writer || !food) {
            const error = new Error('Writer/Food does not exist');
            error.statusCode = 404;
            throw error;
        }

        const oldRating = await Foods.findOne({ _id: this.foodId }).select('rating reviews');
        const newRating = (oldRating.rating * oldRating.reviews.length + this.rating) / (oldRating.reviews.length + 1);
        const ratingUpdate = await Foods.updateOne({ _id: this.foodId }, { rating: newRating });
        if (!ratingUpdate) {
            const error = new Error('Rating update failed');
            error.statusCode = 500;
            throw error;
        }

        const foodUpdate = await Foods.updateOne({ _id: this.foodId }, { $push: { reviews: this._id } });
        if (!foodUpdate) {
            const error = new Error('Review update failed');
            error.statusCode = 500;
            throw error;
        }

        next();
    } catch (error) {
        next(error);
    }
});


reviewSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        const doc = this.getQuery();
        if (update.$push && update.$push.reviews) {
            const writer = doc.writer || update.$push.reviews.writer;
            const bussiness = doc.bussiness || update.$push.reviews.bussiness;
            if (writer || bussiness) {
                const user = await mongoose.model('Users').findById(writer);
                const business = await mongoose.model('Businesses').findById(bussiness);
                if (!user && !business) {
                    const error = new Error('Writer, Business does not exist');
                    error.statusCode = 404;
                    throw error;
                }
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Reviews = mongoose.model('Reviews', reviewSchema)
module.exports = Reviews;