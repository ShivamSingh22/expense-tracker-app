const express = require('express');
const cors=require('cors');

const userRoutes = require('./routes/userRoute');
const expenseRoutes = require('./routes/expenseRoute');
const purchaseRoutes = require('./routes/purchaseRoute')

const sequelize = require('./util/database');

const bodyParser = require('body-parser');

const User= require('./models/userModel');
const Expense = require('./models/expenseModel');
const Order = require('./models/orderModel');

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use('/user',userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase', purchaseRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

sequelize
.sync()
.then(result => {
    app.listen(3000);
    console.log("Listening on port 3000");
})
.catch(err => {
    console.log(err);
})
