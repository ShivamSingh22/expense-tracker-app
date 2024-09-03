const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const sequelize = require("../util/database");
const S3Services = require("../services/s3services");
const FileURLModel = require('../models/fileUrlModel');

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
  const ITEMS_PER_PAGE = Number(req.query.size);
  try {
    const page = Number(req.query.page || 1);
    let totalItems =await Expense.count({where: {userId: req.user.id}});

    const prevExpense = await Expense.findAll({
      where: { userId: req.user.id },
      offset: (page - 1) * ITEMS_PER_PAGE,
      limit : ITEMS_PER_PAGE,
    });
    return res.status(200).json({
      expenses : prevExpense,
      currentPage : page,
      hasNextPage : ITEMS_PER_PAGE * page < totalItems,
      nextPage : page + 1,
      hasPreviousPage : page > 1,
      previousPage : page-1,
      lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const currExpense = await Expense.findOne({
      where: { id: id, userId: req.user.id },
    });
    if (!currExpense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found." });
    }

    const deletedAmount = Number(currExpense.amount);

    await Expense.destroy(
      { where: { id: id, userId: req.user.id } },
      { transaction: t }
    );

    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: "User not found." });
    }

    const currTotalExp = Number(user.totalExpenses);
    const newExp = currTotalExp - deletedAmount;

    await User.update(
      { totalExpenses: newExp },
      { where: { id: req.user.id } },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({ message: "DELETE EXPENSE" });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({
      error: error.message,
    });
  }
};

exports.downloadExpense = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses();
    const stringifiedExpenses = JSON.stringify(expenses);
    //console.log(stringifiedExpenses);
    const userId = req.user.id;
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, filename);
    console.log("YE RAHA >>>>" + fileUrl);
    
    await FileURLModel.create({fileUrl: fileUrl, userId :userId})
    res.status(200).json({ fileUrl: fileUrl, success: true });

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Expenses not found" });
  }
};

exports.getDownloadHistory = async(req,res) => {

  try {
    const userId = req.user.id;
    const downloadHistoryData = await FileURLModel.findAll({where : {userId : userId}});
    res.status(200).json({message : "success", downHist : downloadHistoryData});
  } catch (error) {
    console.log(error); 
    res.status(404).json({message : "NOT FOUND", error : error.message});
  }
}