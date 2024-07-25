const express = require("express");
const Signup = require("../models/signupModel");
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.postSignup = async (req, res, next) => {
  const { username } = req.body;
  const { email } = req.body;
  const { password } = req.body;

  
  try {
    const existingUser = await Signup.findOne({ where: { email } });

    if (existingUser) {
      return res.status(403).json({ message: "ERROR: USER ALREADY EXISTS" });
    } else {
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            if(err){
                return res.status(400).json({hash:"Couldn't hash error"});
            }else{
                await Signup.create({
                    username: username,
                    email: email,
                    password: hash,
                  });
            }
        });
      
      res.status(201).json({ message: "Signup Completed!!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await Signup.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!!" });
    }
    bcrypt.compare(password, user.password, function(err,result){
        if(err){
            res.status(400).json({message: "ERROR IN BCRYPT COMPARE"});
        }else{
            if(result==true){
                res.status(200).json({ message: "User Login successful!" });
            }else if(result==false){
                return res.status(401).json({ message: "User Not Authorised!!" });
            }
        }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
