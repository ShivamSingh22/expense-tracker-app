const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const S3Services = require("../services/s3services");
const FileURLModel = require('../models/fileUrlModel');

exports.addExpense = async (req, res, next) => {
  const { expense, description, category } = req.body;

  try {
    const newExpense = new Expense({
      amount: expense,
      description: description,
      category: category,
      userId: req.user._id, 
    });

    await newExpense.save();

    // Update total expenses for the user
    req.user.totalExpenses += parseInt(expense);
    await req.user.save();

    return res.status(201).json({
      newExpense: newExpense,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getExpense = async (req, res, next) => {
  const ITEMS_PER_PAGE = Number(req.query.size);
  try {
    const page = Number(req.query.page || 1);
    const totalItems = await Expense.countDocuments({ userId: req.user._id });

    const prevExpense = await Expense.find({ userId: req.user._id })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    return res.status(200).json({
      expenses: prevExpense,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currExpense = await Expense.findOne({ _id: id, userId: req.user._id });

    if (!currExpense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    const deletedAmount = currExpense.amount;

    await Expense.deleteOne({ _id: id, userId: req.user._id });

    req.user.totalExpenses -= parseInt(deletedAmount);
    await req.user.save();

    return res.status(200).json({ message: "DELETE EXPENSE" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.downloadExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user._id;
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, filename);

    await FileURLModel.create({ fileUrl: fileUrl, userId: userId });
    res.status(200).json({ fileUrl: fileUrl, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Expenses not found" });
  }
};

exports.getDownloadHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const downloadHistoryData = await FileURLModel.find({ userId: userId });
    res.status(200).json({ message: "success", downHist: downloadHistoryData });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "NOT FOUND", error: error.message });
  }
};
