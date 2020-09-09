const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = express.Router();
const Products = require('../models/Products');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const multer = require('multer');
const Cart = require('../models/Cart');
const { resolve } = require('path');

// setting up multer for images 
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file 
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});




router.get('/', (req, res) => {
    Products.find({}, (err, foundProducts) => {
        if (!err) {
            res.render('index', { Products: foundProducts });
        } else {
            res.render('index', { Products: "" });
        }
    });
});

router.get('/product-information', (req, res) => {
    res.render('product-info');
});


// OPENING THE PRODUCT SELECTED, IN FULL VIEW 
router.get("/product/:id", (req, res) => {
    Products.findOne({ _id: req.params.id }, (err, foundProduct) => {
        if (err) {
            console.log(err);
        } else {
            res.render('product-info', { Product: foundProduct });
        }
    });
});


// ALL ROUTES RELATED TO SHOPPING CART

// i-main shopping cart page rendering 
router.get('/shopping-cart', (req, res) => {
    if (!req.session.cart) {
        return res.render('shoppingCart', { products: null, totalPrice: 0 });
    }
    var cart = new Cart(req.session.cart);
    res.render('shoppingCart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// ii-adding to the shopping cart 
router.get('/add-to-cart/:id', (req, res) => {
    const id = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Products.findById(id, (err, product) => {
        if (err) {
            res.redirect('back');
            console.log(err);
            return;
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/shopping-cart');
    });
});

router.get('/reduce-from-cart/:id', (req, res) => {
    var id = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(id);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove-from-cart/:id', (req, res) => {
    var id = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.removeItem(id);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});


// SEARCH FUNCTIONALITY 
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get('/search', (req, res) => {
    if (req.query.q) {
        const regex = new RegExp(escapeRegex(req.query.q), 'gi');
        Products.find({name: regex}, (err, foundProducts) => {
            if (err) {
                 console.log(err);
             } else { 
                   res.render('search', { Products: foundProducts });
             }
        });
        return;
    }
     res.render('search', { Products: "" });
});

router.get('/shop', (req, res) => {
    Products.find({}, (err, foundProducts) => {
        if (!err) {
            res.render('shop', { Products: foundProducts });
        } else {
            res.render('shop', { Products: "" });
        }
    });
});


router.get('/blog', (req, res) => {
    res.render('blog');
});

router.get('/eachProduct', (req, res) => {
    res.render('eachProduct');
});


// setting up stripe routes 
router.post("/create-checkout-session", async (req, res) => {
    let createArray = new Promise((resolve, reject) => {
        let cart = new Cart(req.session.cart);
        let itemArr = cart.generateArray();
        let items = [];
    
    itemArr.forEach((item) => {
        let name = item.item.name;
        let amount = item.item.price * 100;
        let quantity = item.qty;
        items.push({name, amount, quantity, currency: 'inr'})
    });
    resolve(items)
    });
    try{
        const items = await createArray;
        console.log(items);
        const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ['IN'],
        },
        payment_method_types: ["card"],
        line_items: items,
        //   {
        //     price_data: {
        //       currency: "inr",
        //       product_data: {
        //         name: "T-shirt",
        //         images: ["https://www.google.com/imgres?imgurl=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fd8%2Feb%2F18%2Fd8eb18eab91b008134a8dcdd2d377384.png&imgrefurl=https%3A%2F%2Fin.pinterest.com%2Fpin%2F728246202235787744%2F&tbnid=CtQhdcyPsNZW-M&vet=12ahUKEwjsqs_F99PrAhWoErcAHdvTA6gQMygBegUIARCyAQ..i&docid=EhL2Q6C2486mKM&w=640&h=799&itg=1&q=men%20%20design%20phottography&ved=2ahUKEwjsqs_F99PrAhWoErcAHdvTA6gQMygBegUIARCyAQ"]
        //       },
        //       unit_amount: cart.totalPrice * 100,
        //     },
        //     quantity: 1,
        //   },
        mode: "payment",
        success_url: "http://localhost:5000/success",
        cancel_url: "http://localhost:5000/failure",
      });
    
      res.json({ id: session.id });
    console.log('completed try part');
    } catch(err){
        console.log('error has to be displayed');
        console.log(err);
    }
   
});

// router.get('/success', (req, res) => {
//     res.render('result', { result: true });
// });

// router.get('/cancel', (req, res) => {
//     res.render('result', { result: false });                                                                                        
    
// });

router.get('/success', (req, res) => {
    res.render('success');
});

router.get('/failure', (req, res) => {
    res.render('failure');
});



// ------------------------------ADMIN PAGE----------------------------------------- 
router.get('/admin', (req, res) => {
    res.render('admin');
});

router.post('/admin', upload.array('productImage', 3), (req, res) => {
    let { name, price, description, colour, quantity, size } = req.body;
    console.log(req.body);
    let productImage = req.files;
    productImages = [];
    productImage.forEach((product) => {
        console.log(product.filename);
        productImages.push("/uploads/" + product.filename);
    });
    Products.create({
        productImage: productImages,
        name,
        price,
        colour,
        quantity,
        description,
        size
    });
    res.redirect('/admin');
    console.log('Successfully added to the DB');
});

module.exports = router;