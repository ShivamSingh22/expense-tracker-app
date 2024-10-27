const express = require("express");
const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const saltRounds = 10;

exports.postSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(403).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "Successfully created new user" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

function generateAccessToken(id,name,ispremiumuser){
  return jwt.sign({userId : id, username : name, ispremiumuser:ispremiumuser}, 'eferfefRandomTokenSecretKey')
}

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        ispremiumuser: user.ispremiumuser 
      },
      'eferfefRandomTokenSecretKey'
    );

    res.status(200).json({ 
      message: "User logged in successfully",
      token: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
