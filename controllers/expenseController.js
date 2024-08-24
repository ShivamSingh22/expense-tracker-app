const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const express = require("express");
const sequelize = require("../util/database");

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction(); // creating a transaction object
  const { expense, description, category } = req.body;

  try {
    const newExpense = await Expense.create(
      {
        amount: expense,
        description: description,
        category: category,
        userId: req.user.id,
      },
      { transaction: t }
    );

    const totalExpense = Number(req.user.totalExpenses) + Number(expense);
    console.log("Total expense is : " + totalExpense);

    await User.update(
      {
        totalExpenses: totalExpense,
      },
      {
        where: { id: req.user.id },
        transaction: t,
      }
    );

    await t.commit();

    return res.status(201).json({
      newExpense: newExpense,
    });

  } catch (error) {
    await t.rollback();
    return res.status(400).json({ error: error.message });
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const prevExpense = await Expense.findAll({
      where: { userId: req.user.id },
    });
    return res.status(200).json(prevExpense);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res, next) => {

    const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const currExpense = await Expense.findOne({ where: { id: id, userId: req.user.id } });
    if (!currExpense) {
        await t.rollback();
        return res.status(404).json({ error: "Expense not found." });
      }

    const deletedAmount = Number(currExpense.amount);

    await Expense.destroy({ where: { id: id, userId: req.user.id } }, {transaction: t});

    const user = await User.findOne({where: {id: req.user.id}});
    if (!user) {
        await t.rollback();
        return res.status(404).json({ error: "User not found." });
      }
    
    const currTotalExp = Number(user.totalExpenses);
    const newExp = currTotalExp - deletedAmount;
    
    await User.update({totalExpenses:newExp}, {where: {id: req.user.id}}, {transaction: t});

    await t.commit();
    return res.status(200).json({ message: "DELETE EXPENSE" });

  } catch (error) {
    await t.rollback();
    return res.status(400).json({
      error: error.message,
    });
  }
};
