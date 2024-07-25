const express = require("express");
const Signup = require("../models/signupModel");

exports.postSignup = async (req, res, next) => {
  const { username } = req.body;
  const { email } = req.body;
  const { password } = req.body;
  try {
    const existingUser = await Signup.findOne({ where: { email } });

    if (existingUser) {
      return res.status(403).json({ message: "ERROR: USER ALREADY EXISTS" });
    } else {
      await Signup.create({
        username: username,
        email: email,
        password: password,
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
      return res.status(403).json({ message: "USER DOES NOT EXIST!!" });
    }
    if (user.password !== password) {
      return res.status(403).json({ message: "BAD CREDENTIALS!!" });
    }

    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
