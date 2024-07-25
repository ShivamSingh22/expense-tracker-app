const express = require('express');
const Signup = require('../models/signup');

exports.postSignup = async (req,res,next) => {
    const {username} = req.body;
    const {email} = req.body;
    const {password} = req.body;
    try{
        await Signup.create({
            username:username,
            email:email,
            password:password
        });
        res.status(201).json({message: "Signup Completed!!"});
    }catch(error){
        res.status(500).json({ error: error.message });
    }
    
}
