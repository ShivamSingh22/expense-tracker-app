const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const express = require("express");
const sequelize = require('sequelize')

exports.getUserLeaderboard = async (req, res, next) => {
  try {
    
    const leaderboardofusers = await User.findAll({
        order: [['totalExpenses','DESC']]
    });

    res.status(200).json(leaderboardofusers);

  } catch (error) {

    console.log(error);
    res.status(500).json(error);
  }
};
