const Expense = require('../models/expenseModel');
const User = require('../models/userModel');
const express = require('express');


exports.addExpense = async (req,res,next) => {
    const {expense,description,category} = req.body;
    try {
        const totalExpense = Number(req.user.totalExpenses) + Number(expense);
        console.log("Total expense is : " + totalExpense);

        await User.update({
            totalExpenses : totalExpense
        },
        {
            where: {id: req.user.id}
        })

        const newExpense = await Expense.create({
            amount: expense,
            description: description,
            category: category,
            userId : req.user.id
        });
        res.status(201).json({
            newExpense:newExpense
        })
    } catch (error) {
        res.status(400).json({error: error.message});
    }

}

exports.getExpense = async (req,res,next) => {
    try {
        const prevExpense =await Expense.findAll({where: {userId : req.user.id}});
        res.status(200).json(prevExpense);
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}

exports.deleteExpense = async (req,res,next) => {
    try {
        const {id}=req.params;
     
        await Expense.destroy({where: {id:id, userId :req.user.id} });
        res.status(200).json({message:"DELETE EXPENSE"});
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}