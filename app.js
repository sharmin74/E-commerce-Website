require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// setting up the app 
const app = express();

// setting the view engine to EJS
app.set('view engine', 'ejs');

// bodyParser
app.use(express.urlencoded({ extended: true }));

// To serve Static files
app.use(express.static(__dirname + "/public"));


var date = new Date();
// Setting up express session 
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    // Set session to expire after 21 days
    cookie: {
        maxAge: date.setTime(date.getTime() + (10 * 24 * 60 * 60 * 1000))
    },
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// Connecting to the DataBase
mongoose.connect('mongodb+srv://admin-sharmin-sangeeta:' + process.env.ATLAS_PASSWORD + '@cluster0.348cu.mongodb.net/tkaStoresDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log("MongoDB connected...."))
    .catch(err => console.log(err));

mongoose.set('useCreateIndex', true);


// Routes 
app.use('/', require('./routes/index'));


// Listening on port 3000!
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Listening on port 5000!');
});