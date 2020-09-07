const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productImage: {
        type: [],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    colour: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    size: {
        type: String,
        enum: ['s', 'm', 'l', 'xl'],
        required: true
    }
});

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;