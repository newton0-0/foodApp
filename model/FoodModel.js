const mongoose = require('mongoose');

const Business = require('./BusinessModel');

const foodSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Businesses'
    },
    title: {
        type: String,
        required: [true, 'Name is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    category: {
        type: String,
        enum: ['veg', 'non-veg'],
        required: [true, 'Category is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required']
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviews'
    }]
}, { timestamps : true });


// Middleware function to push the objectId of food item into the attribute menu of the businesses collection and if the operation is unsuccessful delete the food item document
foodSchema.post('save', async function(doc) {
    try {
        await Business.updateOne({ _id: doc.shop }, { $push: { menu: doc._id } });
    } catch (error) {
        await Food.deleteOne({ _id: doc._id });
        throw error;
    }
});

const Food = mongoose.model('Foods', foodSchema);
module.exports = Food;