const Expense = require('../models/expenseModel');
const express = require('express');

exports.addExpense = async (req,res,next) => {
    const {expense,description,category} = req.body;

    try {
        const newExpense = await Expense.create({
            amount: expense,
            description: description,
            category: category
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
        const prevExpense =await Expense.findAll();
        res.json(prevExpense);
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}

exports.deleteExpense = async (req,res,next) => {
    try {
        const {id}=req.params;
        await Expense.destroy({where: {id:id}});
        res.status(200).json({message:"DELETE EXPENSE"});
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}