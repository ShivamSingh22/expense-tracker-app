const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();

const userRoutes = require('./routes/userRoute');
const expenseRoutes = require('./routes/expenseRoute');
const purchaseRoutes = require('./routes/purchaseRoute')
const premiumRoutes = require('./routes/premiumRoute');
const passwordRoutes = require('./routes/passwordRoute');


const bodyParser = require('body-parser');

const User= require('./models/userModel');
const Expense = require('./models/expenseModel');
const Order = require('./models/orderModel');
const ForgotPassword = require('./models/forgotPassModel');
const FileURLModel = require('./models/fileUrlModel');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ extended: false }));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),{flags : 'a'});

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream: accessLogStream}));

// Routes
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000);
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

module.exports = app;
