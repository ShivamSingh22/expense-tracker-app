const express = require('express');
const userRoutes = require('./routes/userRoute');
const cors=require('cors');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use('/user',userRoutes);

sequelize
.sync()
.then(result => {
    app.listen(3000);
    console.log("Listening on port 3000");
})
.catch(err => {
    console.log(err);
})
