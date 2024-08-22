const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const express = require("express");

exports.getUserLeaderboard = async (req, res, next) => {
  try {
    const expenseData = await Expense.findAll();
    const userData = await User.findAll();
    const userAggregatedExpenses = {};

    expenseData.forEach((expense) => {
        if(userAggregatedExpenses[expense.userId]){
            userAggregatedExpenses[expense.userId] = userAggregatedExpenses[expense.userId] + expense.amount;
        }else{
            userAggregatedExpenses[expense.userId] = expense.amount;
        }
        
    });

    var userLeaderBoardDetails = [];
    userData.forEach((user) => {
        userLeaderBoardDetails.push({ name: user.username, total_cost: userAggregatedExpenses[user.id] || 0});
    })
    console.log(userLeaderBoardDetails);
   userLeaderBoardDetails.sort((a,b) => b.total_cost - a.total_cost);
    res.status(200).json(userLeaderBoardDetails);

  } catch (error) {
    
    console.log(error);
    res.status(500).json(error);
  }
};
