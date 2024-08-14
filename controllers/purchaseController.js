const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const userController = require('./userController');
const jwt = require("jsonwebtoken");

require('dotenv').config();

function generateAccessToken(id,name,ispremiumuser){
    console.log('Signing token');
    return jwt.sign({userId : id, username : name, ispremiumuser:ispremiumuser}, 'eferfefRandomTokenSecretKey')
}

exports.getPremium = async(req,res,next) => {
    try {
        var rzp = new Razorpay({
            key_id : process.env.RAZORPAY_KEY_ID,
            key_secret : process.env.RAZORPAY_KEY_SECRET
        })
        
        const amount = 2500;

        rzp.orders.create({amount,currency:"INR"}, (err,order) => {
            if(err){
                console.log(err);
                //throw new Error(JSON.stringify(err));
            }
            req.user.createOrder({orderid: order.id, status: 'PENDING'}).then(() => {
                return res.status(201).json({order, key_id : rzp.key_id});
            })
            .catch(err => {
                throw new Error(err);
            })
        })
    } catch (error) {
        console.log(error);
        res.status(403).json({message : 'Something went wrong', error: error})
    }
}

exports.postSuccessPremium = async(req,res,next) => {
    try {
        const {payment_id,order_id} = req.body;
        const userId = req.user.userId;
        const order = await Order.findOne({where : {orderid: order_id}});

            const promise1 = order.update({paymentid: payment_id, status: 'SUCCESSFUL',ispremiumuser: true});
            const promise2 = req.user.update({ispremiumuser : true})
            const promise3 = User.update(
                { ispremiumuser: true },
                { where: { id: order.userId } } 
              );
            
            Promise.all([promise1,promise2,promise3])
            .then(()=>{
                return res.status(202).json({success: true, message: "Transaction Successful", token: generateAccessToken(userId, undefined, true)});
            })
            .catch(error => {
                throw new Error(error);
            })
            
                
    } catch (error) {
        res.status(403).json({message: error.message});
        console.log(error);
    }
}

exports.postFailedPremium = async(req,res,next) => {
    try {
        const {order_id} = req.body;

        const order = await Order.findOne({where: {orderid: order_id}});
        await order.update({status: 'FAILED'});

        return res.status(400).json({success: false, message: "Transaction Failed"})
    } catch (error) {
        res.status(403).json({message: error.message});
        console.log(error);
    }
}