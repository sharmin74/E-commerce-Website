const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('index');
});


router.get('/product-information', (req, res) => {
    res.render('product-info');
});


router.get('/shopping-cart', (req, res) => {
    res.render('shoppingCart');
});

module.exports = router;