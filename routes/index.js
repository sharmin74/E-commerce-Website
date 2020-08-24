const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = express.Router();


router.get('/', (req, res) => {
    res.send('This is your index page');
});

module.exports = router;