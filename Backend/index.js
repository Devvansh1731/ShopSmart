const express = require("express");
const bcrypt = require('bcrypt')
const path = require("path");
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5100;
const mongoose = require('mongoose');
const { MONGO_URI } = require('./db/connect');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const models = require("./db/schema");

app.use(cors());

// admin middleware
function adminAuthenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized - No token provided' });
    
    try {
        const decoded = jwt.verify(token, 'ADMIN_SECRET_TOKEN');
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Forbidden - Admin access required' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }
}

// user middleware
const userAuthenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
        }
        const decoded = jwt.verify(token, 'USER_SECRET_TOKEN');
        if (decoded.isAdmin) {
            return res.status(403).json({ message: 'Forbidden - User access only' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }
};


// admin schema
app.post('/adminlogin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await models.Admins.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate admin JWT token with isAdmin flag
        const token = jwt.sign(
            { 
                userId: admin._id,
                isAdmin: true,
                email: admin.email
            },
            'ADMIN_SECRET_TOKEN',
            { expiresIn: '24h' }
        );

        res.json({ 
            user: {
                _id: admin._id,
                firstname: admin.firstname,
                lastname: admin.lastname,
                email: admin.email,
                isAdmin: true
            },
            token 
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


// user schema
app.post('/adminregister', async (req, res) => {
    try {
        const { firstname, lastname, username, email, password } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if username exists
        const usernameExists = await models.Admins.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if email exists
        const emailExists = await models.Admins.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new models.Admins({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({ message: 'Successfully registered' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        return res.status(500).json({ message: 'An error occurred during registration' });
    }
});



// API endpoint to add a category
app.post('/add-category', async (req, res) => {
    try {
        const { category, description } = req.body;
        if (!category) {
            return res.status(400).send('Category and description are required');
        }
        const existingCategory = await models.Category.findOne({ category });
        if (existingCategory) {
            return res.status(400).send('Category already exists');
        }
        const newCategory = new models.Category({
            category,
            description
        });
        const savedCategory = await newCategory.save();
        console.log(savedCategory, 'category created');
        return res.status(200).send(savedCategory);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const cotegoriesList = await models.Category.find();
        res.status(200).send(cotegoriesList);
    } catch (error) {
        res.status(500).send('Server error');
        console.log(error);
    }
})

     
// Server-side code (e.g., in your Node.js + Express.js backend)

// Define a route for handling the POST request to '/add-products'
app.post('/add-products', async (req, res) => {
    try {      
        // Extract the product information from the request body
        const { productname, description, price, image, category, countInStock, rating } = req.body;

        // Validate if all required fields are provided
        if (!productname || !description || !price || !image || !category || !countInStock || !rating) {
            return res.status(400).send({ message: 'Missing required fields' });
        }

        // Assuming models.Product and models.Category are defined and imported properly
        // Create a new product document
        const product = new models.Product({
            productname,
            description,
            price,
            image,
            category,
            countInStock,
            rating,
            dateCreated: new Date()
        });

        // Save the new product document to the database
        await product.save();

        // Send a success response with the newly created product
        res.status(201).send(product);
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});



// Endpoint for adding an item to the cart
app.post('/add-to-cart', async (req, res) => {
    const {userId, productId, productName, quantity = 1 } = req.body;
    const item = new models.AddToCart({userId, productId,productName, quantity });
    try {
        await item.save();
        res.status(200).json({ message: `Added ${quantity} of product ${productId} to cart` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.delete('/remove-from-cart/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await models.AddToCart.deleteOne({ productId: id });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: `Product with id ${id} not found in the cart` });
        } else {
            res.status(200).json({ message: `Removed product with id ${id} from cart` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/cart/:id', async (req, res) => {
    try {
        const cartItems = await models.AddToCart.find({ userId: req.params.id });
        const productIds = cartItems.map(item => item.productId);
        const products = await models.Product.find({ _id: { $in: productIds } });
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.post('/orders', async (req, res) => {
    const { firstname, lastname, user, phone, productId, quantity, paymentMethod, address, paymentDetails } = req.body;
    const product = await models.Product.findById(productId);
    const amount = product.price * quantity;
    
    try {
        // Create order
        const order = new models.Order({
            firstname,
            lastname,
            user,
            price: amount,
            phone,
            productId,
            productName: product.productname,
            quantity,
            paymentMethod,
            address
        });
        const newOrder = await order.save();

        // Initialize payment
        const payment = new models.Payment({
            user,
            name: firstname + " " + lastname,
            order: newOrder._id,
            amount,
            deliveryStatus: newOrder.status,
            paymentMethod,
            status: 'Pending'
        });

        // Process payment based on method
        if (paymentMethod !== 'cod') {
            payment.status = 'Processing';
            
            // Add payment details based on method
            if (paymentDetails) {
                payment.paymentDetails = {
                    ...paymentDetails,
                    transactionId: 'TXN' + Date.now() + Math.random().toString(36).substring(7)
                };
            }

            try {
                // Here you would integrate with actual payment gateways
                // This is a placeholder for payment processing
                const mockPaymentResponse = await processPayment(paymentMethod, amount, paymentDetails);
                payment.paymentDetails.paymentGatewayResponse = mockPaymentResponse;
                
                if (mockPaymentResponse.status === 'success') {
                    payment.status = 'Success';
                    newOrder.status = 'Confirmed';
                    await newOrder.save();
                } else {
                    payment.status = 'Failed';
                    newOrder.status = 'Canceled';
                    await newOrder.save();
                }
            } catch (error) {
                payment.status = 'Failed';
                payment.paymentDetails.paymentGatewayResponse = { error: error.message };
                newOrder.status = 'Canceled';
                await newOrder.save();
            }
        }

        const savedPayment = await payment.save();
        res.status(201).json({ order: newOrder, payment: savedPayment });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Mock payment processing function
async function processPayment(paymentMethod, amount, paymentDetails) {
    // This is a mock function that simulates payment gateway integration
    // In production, this would be replaced with actual payment gateway API calls
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate 90% success rate
            const isSuccess = Math.random() < 0.9;
            
            if (isSuccess) {
                resolve({
                    status: 'success',
                    transactionId: 'PG' + Date.now(),
                    message: 'Payment processed successfully',
                    amount: amount,
                    currency: 'USD',
                    timestamp: new Date().toISOString()
                });
            } else {
                resolve({
                    status: 'failed',
                    error: 'Payment processing failed',
                    errorCode: 'PG_ERROR',
                    timestamp: new Date().toISOString()
                });
            }
        }, 1000); // Simulate network delay
    });
}

app.get('/payments', async (req, res) => {
    try {
        const payments = await models.Payment.find();
        res.status(200).json(payments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



app.get('/orders', async (req, res) => {
    try {
        const order = await models.Order.find();
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Define a route for fetching orders by user ID
app.get('/my-orders/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const userOrders = await models.Order.find({ user: userId });
        if (userOrders.length === 0) {
            return res.status(404).json({ message: 'User orders not found' });
        }
        res.json(userOrders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const order = await models.Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        order.status = status; // Update the order status property
        order.createdAt = Date.now()
        const payment = await models.Payment.findOne({ order: orderId });
        if (!payment) {
            return res.status(404).send('Payment not found');
        }

        payment.deliveryStatus = status; // Update the payment status property
        if(status === 'Delivered'){
            payment.status = 'Success'
        }else{
            payment.status = "Pending"
        }
        payment.createdAt = Date.now()
        await payment.save();
        const updatedOrder = await order.save();
        res.send(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.put('/cancel-order/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const order = await models.Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        order.status = status; 
        const payment = await models.Payment.findOne({ order: orderId });
        if (!payment) {
            return res.status(404).send('Payment not found');
        }
        payment.deliveryStatus = status;
        payment.status = "Failed"
        payment.createdAt = Date.now()
        await payment.save();
        const updatedOrder = await order.save();
        res.send(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/orders/:id', async (req, res) => {
    try {
        const order = await models.Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /payments
app.post('/payments', async (req, res) => {
    try {
        const payment = new models.Payment(req.body);
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Define the route for updating a payment
app.put('/payment/:id', async (req, res) => {
    try {
        const paymentId = req.params.id;

        const payment = await models.Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).send('Payment not found');
        }
        const { amount, status } = req.body;
        if (!amount || !status) {
            return res.status(400).json({ message: 'Both amount and status are required' });
        }
        const updatedPayment = await models.Payment.findByIdAndUpdate(
            paymentId,
            { amount, status },
            { new: true, runValidators: true }
        );
        res.status(200).json({
            message: 'Payment updated successfully',
            payment: updatedPayment,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid payment ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Create feedback from user
app.post('/feedback', async (req, res) => {
    try {
        const { user, message } = req.body;
        const feedback = new models.Feedback({ user, message });
        const savedFeedback = await feedback.save();
        res.status(201).json(savedFeedback);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Check feedback (admin only)
app.get('/feedback', async (req, res) => {
    try {
        const feedback = await models.Feedback.find();
        res.status(200).send(feedback);
    } catch (error) {
        res.status(500).send('Server error');
        console.log(error);
    }
});

// Update user login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await models.Users.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate user JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                isAdmin: false,
                email: user.email
            },
            'USER_SECRET_TOKEN',
            { expiresIn: '24h' }
        );

        res.json({ 
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                isAdmin: false
            },
            token 
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// user schema
app.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, username, email, password } = req.body;

        if (!username) {
            return res.status(400).send('Username is required');
        }                     

        const userExists = await models.Users.findOne({ username });

        if (userExists) {    
            return res.status(400).send('Username already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new models.Users({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword
        });

        const userCreated = await newUser.save();
        console.log(userCreated, 'user created');
        return res.status(201).json({ message: 'Successfully registered' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'An error occurred during registration' });

    }
});

// get users
app.get('/users', async (req, res) => {
    try {
        const users = await models.Users.find();
        res.send(users);
    } catch (error) {
        res.status(500).send('Server error');
        console.log(error);
    }
});

app.delete('/userdelete/:id',(req,res)=>{        
    let id=req.params.id;
    models.Users.deleteOne({ _id: id })
       .then((user)=>{
        res.status(200).json(user)
         })
       .catch(() => {
        res.sendStatus(500)
       })
})

app.get('/getbookings/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const booking = await models.Order.find({ userId }).sort('position');
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.delete('/userbookingdelete/:id',(req,res)=>{
    let id=req.params.id;
    models.Order.deleteOne({_id : id})
    .then((item)=>{
          res.status(200).json(item)
    })
    .catch(()=>{
        res.status(400).json({msg:"No item found"})
    })
})

// Get Products
const getAllProducts = async () => {
    try {
        const products = await models.Product.find();
        return products;
    } catch (error) {
        console.log(error);
        return error;
    }
};

// Define a route for the "get products" API endpoint
app.get('/products', async (req, res) => {
    const products = await getAllProducts();
    res.json(products);
});

// Get a single product
app.get('/products/:id', async (req, res) => {
    try {
        const product = await models.Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(`Error getting product with id ${req.params.id}`, error);
        res.status(500).json({ message: `Error getting product with id ${req.params.id}` });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const deletedProduct = await models.Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        console.error(`Error deleting product with id ${req.params.id}`, error);
        res.status(500).json({ message: `Error deleting product with id ${req.params.id}` });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await models.Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(`Error updating product with id ${req.params.id}`, error);
        res.status(500).json({ message: `Error updating product with id ${req.params.id}` });
    }
});

// User Registration endpoint
app.post('/signup', async (req, res) => {
    try {
        const { firstname, lastname, username, email, password } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const userExists = await models.Users.findOne({ 
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email or username' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new models.Users({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword
        });

        // Save user
        const userCreated = await newUser.save();
        
        // Generate JWT token with isAdmin flag
        const token = jwt.sign(
            { 
                userId: userCreated._id,
                isAdmin: false,
                email: userCreated.email
            },
            'USER_SECRET_TOKEN',
            { expiresIn: '24h' }
        );

        // Return success response
        return res.status(201).json({ 
            message: 'Successfully registered',
            token,
            user: {
                id: userCreated._id,
                firstname: userCreated.firstname,
                lastname: userCreated.lastname,
                username: userCreated.username,
                email: userCreated.email,
                isAdmin: false
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'An error occurred during registration' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;