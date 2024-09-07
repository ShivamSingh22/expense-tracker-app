const express = require('express');
const fs = require('fs');
const path = require('path');
const cors=require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();



const userRoutes = require('./routes/userRoute');
const expenseRoutes = require('./routes/expenseRoute');
const purchaseRoutes = require('./routes/purchaseRoute')
const premiumRoutes = require('./routes/premiumRoute');
const passwordRoutes = require('./routes/passwordRoute');

const sequelize = require('./util/database');

const bodyParser = require('body-parser');

const User= require('./models/userModel');
const Expense = require('./models/expenseModel');
const Order = require('./models/orderModel');
const ForgotPassword = require('./models/forgotPassModel');
const FileURLModel = require('./models/fileUrlModel');

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),{flags : 'a'});

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream: accessLogStream}));

app.use('/user',userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(FileURLModel);
FileURLModel.belongsTo(User);

sequelize
.sync()
.then(result => {
    app.listen(process.env.PORT || 3000);
    console.log(`Listening on ${process.env.PORT}`);
    
})
.catch(err => {
    console.log(err);
})
