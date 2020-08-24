require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const path = require('path');

// setting up the app 
const app = express();

// setting the view engine to EJS
app.set('view engine', 'ejs');

// bodyParser
app.use(express.urlencoded({ extended: true }));

// To serve Static files
app.use(express.static(__dirname + "/public"));

// Routes 
app.use('/', require('./routes/index'));


// Listening on port 3000!
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Listening on port 3000!');
});