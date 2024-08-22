const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const express = require("express");
const sequelize = require('sequelize')

exports.getUserLeaderboard = async (req, res, next) => {
  try {
    
    const leaderboardofusers = await User.findAll({
        attributes: ['id', 'username',[sequelize.fn('sum', sequelize.col('amount')) ,'total_cost']],
        include: [
            {
                model : Expense,
                attributes: []
        }
        ], 
        group: ['users.id'],
        order: [['total_cost','DESC']]
    });

    res.status(200).json(leaderboardofusers);

  } catch (error) {

    console.log(error);
    res.status(500).json(error);
  }
};
