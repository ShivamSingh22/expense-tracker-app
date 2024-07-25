const express = require('express');
const userRoutes = require('./routes/userRoute');
const expenseRoutes = require('./routes/expenseRoute');
const cors=require('cors');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use('/user',userRoutes);
app.use('/expense',expenseRoutes);

sequelize
.sync()
.then(result => {
    app.listen(3000);
    console.log("Listening on port 3000");
})
.catch(err => {
    console.log(err);
})
