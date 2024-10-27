const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");

require('dotenv').config();

function generateAccessToken(id, name, ispremiumuser) {
    return jwt.sign(
        { userId: id, username: name, ispremiumuser: ispremiumuser },
        'eferfefRandomTokenSecretKey'
    );
}

exports.getPremium = async (req, res, next) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err });
            }

            const newOrder = new Order({
                orderid: order.id,
                status: 'PENDING',
                userId: req.user._id
            });
            await newOrder.save();

            return res.status(201).json({ order, key_id: rzp.key_id });
        });
    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong', error: error });
    }
};

exports.postSuccessPremium = async (req, res, next) => {
    try {
        const { payment_id, order_id } = req.body;
        const userId = req.user._id;

        const order = await Order.findOne({ orderid: order_id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await Order.updateOne(
            { orderid: order_id },
            {
                paymentid: payment_id,
                status: 'SUCCESSFUL',
                ispremiumuser: true
            }
        );

        await User.updateOne(
            { _id: userId },
            { ispremiumuser: true }
        );

        return res.status(202).json({
            success: true,
            message: "Transaction Successful",
            token: generateAccessToken(userId, req.user.username, true)
        });
    } catch (error) {
        res.status(403).json({ message: error.message });
        console.log(error);
    }
};

exports.postFailedPremium = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        await Order.updateOne(
            { orderid: order_id },
            { status: 'FAILED' }
        );
        return res.status(400).json({ success: false, message: "Transaction Failed" });
    } catch (error) {
        res.status(403).json({ message: error.message });
        console.log(error);
    }
};
